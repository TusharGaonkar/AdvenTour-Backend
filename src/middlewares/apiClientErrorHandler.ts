import { Request, Response, NextFunction } from 'express';
type CallbackFnType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

type ErrorHandlerWrapperType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

// Only use apiClientErrorHandler to handle errors in  async functions , for sync function errors just throw new AdentourAppError() with custom error codes;
const apiClientErrorHandler = (
  callbackFn: CallbackFnType
): ErrorHandlerWrapperType => {
  return async (req, res, next) => {
    try {
      await callbackFn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default apiClientErrorHandler;
