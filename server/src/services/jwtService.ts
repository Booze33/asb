import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

export interface AdminPayload {
  id: number;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  id: number;
  email: string;
  role: string;
  tokenId: string;
}

export class JWTService {
  generateToken(payload: AdminPayload): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    } as jwt.SignOptions);
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || jwtConfig.secret + '_refresh';
    const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    
    return jwt.sign(payload, refreshTokenSecret, {
      expiresIn: refreshTokenExpiry
    } as jwt.SignOptions);
  }

  verifyToken(token: string): AdminPayload | null {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as AdminPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || jwtConfig.secret + '_refresh';
      const decoded = jwt.verify(token, refreshTokenSecret) as RefreshTokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  getTokenExpirationTime(token: string): number | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return decoded.exp * 1000; // Convert to milliseconds
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const expirationTime = this.getTokenExpirationTime(token);
    if (!expirationTime) return true;
    
    return Date.now() >= expirationTime;
  }

  getTokenRemainingTime(token: string): number {
    const expirationTime = this.getTokenExpirationTime(token);
    if (!expirationTime) return 0;
    
    return Math.max(0, expirationTime - Date.now());
  }
}

export const jwtService = new JWTService();