import RequestError from './RequestError';

class RequestTimeoutError extends RequestError {
  name = 'RequestTimeoutError';
}

export default RequestTimeoutError;
