import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
};
