import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY;

export const generateJwt = (payload) => {
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

export const verifyJwt = (token) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};
