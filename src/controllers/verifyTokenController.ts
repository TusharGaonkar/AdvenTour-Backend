import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return passport.authenticate('jwt', { session: false, failWithError: true })(
    req,
    res,
    next
  );
};

export const successResponse = (
  req: Request & { user: any },
  res: Response
) => {
  const { userName, email, role, avatar } = req.user;
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        userName,
        email,
        role,
        avatar,
      },
    },
  });
};
