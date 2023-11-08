import { Request, Response, NextFunction } from 'express';
import AdentourAppError from '../utils/adventourAppError';

const handleProductionErrors = (error: AdentourAppError, res: Response) => {
  // send only the client side errors as a response
  if (error.isClientError)
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  else
    console.log(
      "Something went wrong in the AdvenTour Server it's not an error from your end , please contact gaonkar.tushar01@gmail.com!"
    );
};

const handleDevelopmentErrors = (error: AdentourAppError, res: Response) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stackTrace,
    errorDetail: error,
  });
};
const apiErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverError = new AdentourAppError(
    error.message ?? 'Something went wrong',
    //throw generic server fail error code if not present!
    error.statusCode ?? error.status ?? 500 // error.status for passport errors 401 ;
  );
  if (process.env.NODE_ENV === 'production') {
    handleProductionErrors(serverError, res);
  } else if (process.env.NODE_ENV == 'development') {
    handleDevelopmentErrors(serverError, res);
  }
};

export default apiErrorHandler;
