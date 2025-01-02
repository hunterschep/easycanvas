import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

export const securityMiddleware = {
  helmet: helmet(),
  
  methodCheck: (req: Request, res: Response, next: NextFunction) => {
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
      return res.status(405).end();
    }
    next();
  },
  
  authCheck: (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization && !req.path.startsWith('/auth')) {
      return res.status(401).end();
    }
    next();
  }
}; 