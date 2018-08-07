import ExtendableError from 'es6-error';

class WarcraftLogsApiError extends ExtendableError {
  statusCode = 500;
  context = null;
  constructor(statusCode, message, context) {
    super(message);
    this.statusCode = statusCode;
    this.context = context;
  }
}

export default WarcraftLogsApiError;
