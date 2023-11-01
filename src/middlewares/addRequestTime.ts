import { Request, Response, NextFunction } from 'express';

export default (
  req: Request & { requestTime: string },
  res: Response,
  next: NextFunction
) => {
  req.requestTime = new Date().toISOString();
  next();
};
