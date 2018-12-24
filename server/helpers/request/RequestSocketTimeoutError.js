import RequestError from './RequestError';

class RequestSocketTimeoutError extends RequestError {
  name = 'RequestSocketTimeoutError';
}

export default RequestSocketTimeoutError;
