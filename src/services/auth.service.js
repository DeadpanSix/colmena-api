const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}

class AccountLockedError extends Error {
  constructor(lockedUntil) {
    super('Account temporarily locked due to multiple failed attempts');
    this.name = 'AccountLockedError';
    this.lockedUntil = lockedUntil;
  }
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new InvalidCredentialsError();
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AccountLockedError(user.lockedUntil);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    await handleFailedAttempt(user);
    throw new InvalidCredentialsError();
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null },
  });

  const tokens = generateTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

async function handleFailedAttempt(user) {
  const newFailedAttempts = user.failedAttempts + 1;
  const shouldLock = newFailedAttempts >= MAX_FAILED_ATTEMPTS;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedAttempts: newFailedAttempts,
      lockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
    },
  });
}

function generateTokens(user) {
  const payload = { userId: user.id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return { accessToken, refreshToken };
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
  };
}

module.exports = {
  login,
  InvalidCredentialsError,
  AccountLockedError,
};
