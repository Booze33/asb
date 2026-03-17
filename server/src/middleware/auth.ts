import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwtService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = jwtService.extractTokenFromHeader(authHeader);

  if (!token) {
    res.status(401).json({ 
      success: false,
      message: 'Access token required' 
    });
    return;
  }

  const decoded = jwtService.verifyToken(token);
  if (!decoded) {
    res.status(403).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
    return;
  }

  req.user = decoded;
  next();
};

export const requireAdminRole = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const user = req.user;
  
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (user.role !== 'admin' && user.role !== 'manager') {
    res.status(403).json({
      success: false,
      message: 'Insufficient permissions'
    });
    return;
  }

  next();
};
