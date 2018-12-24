import RequestError from './RequestError';

class RequestUnknownError extends RequestError {
  name = 'RequestUnknownError';
}

export default RequestUnknownError;
