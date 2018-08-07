import ExtendableError from 'es6-error';

class WarcraftLogsApiError extends ExtendableError {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default WarcraftLogsApiError;
