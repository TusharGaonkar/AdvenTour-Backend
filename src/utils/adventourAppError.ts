export default class AdentourAppError extends Error {
  private readonly _isClientError: Boolean;
  private readonly _status: 'fail' | 'error';
  private readonly _statusCode: number;
  constructor(errMessage: string, statusCode: number) {
    super(errMessage);
    this._statusCode = statusCode;
    this._status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this._isClientError = this._status === 'fail' ? true : false;
    // typescript error doesn't set the prototype automatically!!
    Object.setPrototypeOf(this, AdentourAppError.prototype);
    Error.captureStackTrace(this, this.constructor);
    // add stack trace to this instance,make sure to hide the constructor from the stack trace as it shows up by default
  }

  // getters for the class!
  public get isClientError() {
    return this._isClientError;
  }

  public get status() {
    return this._status;
  }

  public get statusCode() {
    return this._statusCode;
  }

  public get errorMessage() {
    return this.message;
  }

  public get stackTrace() {
    return this.stack;
  }
}
