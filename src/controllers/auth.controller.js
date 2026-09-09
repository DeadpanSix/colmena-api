const { z } = require('zod');
const authService = require('../services/auth.service');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function login(req, res) {
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  const { email, password } = parseResult.data;

  try {
    const result = await authService.login(email, password);
    return res.status(200).json(result);
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

module.exports = { login };
