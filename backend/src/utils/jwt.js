const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshToken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';

/**
 * Generate access token
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate refresh token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      type: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Generate token pair (access + refresh)
 */
async function generateTokenPair(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Calculate expiration date for refresh token
  const expiresAt = new Date();
  const expiry = REFRESH_TOKEN_EXPIRY;

  if (expiry.endsWith('d')) {
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiry));
  } else if (expiry.endsWith('h')) {
    expiresAt.setHours(expiresAt.getHours() + parseInt(expiry));
  } else if (expiry.endsWith('m')) {
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiry));
  }

  // Store refresh token in database
  await RefreshToken.create(user.id, refreshToken, expiresAt);

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair
};
