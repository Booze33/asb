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
  // First try to get token from Authorization header (for API calls)
  const authHeader = req.headers['authorization'];
  let token = jwtService.extractTokenFromHeader(authHeader);

  console.log('=======================================check token 1:', authHeader);
  

  // If no token in header, try to get from cookies (for browser requests)
  if (!token && req.cookies && req.cookies.admin_token) {
    console.log('=======================================check token 2:', req.cookies);
    token = req.cookies.admin_token;
  }

  console.log('=======================================Received token:', token);

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
