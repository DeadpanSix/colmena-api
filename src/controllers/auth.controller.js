const { z } = require('zod');
const prisma = require('../config/database');
const authService = require('../services/auth.service');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT_REFRESH_EXPIRES_IN
  path: '/api/auth', // only for auth-related endpoints
};

async function login(req, res) {
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  const { email, password } = parseResult.data;

  try {
    const result = await authService.login(email, password);

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    if (error instanceof authService.InvalidCredentialsError) {
      return res.status(401).json({ error: error.message });
    }

    if (error instanceof authService.AccountLockedError) {
      return res.status(423).json({
        error: error.message,
        lockedUntil: error.lockedUntil,
      });
    }

    console.error('Unexpected login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
    teamId: user.teamId
  });
}

async function refresh(req, res) {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

  try {
    const accessToken = await authService.refreshAccessToken(refreshToken);
    return res.status(200).json({ accessToken });
  } catch (error) {
    if (error instanceof authService.InvalidCredentialsError) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    console.error('Unexpected refresh error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  return res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = { login, me, refresh, logout };
