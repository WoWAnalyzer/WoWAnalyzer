import request from 'request-promise-native';
import { RequestError } from 'request-promise-native/errors';

async function retryingRequest(options, attempt = 1) {
  try {
    return await request.get(options);
  } catch (err) {
    if (err instanceof RequestError) {
      const maxAttempts = options.maxAttempts || 2;
      if (attempt < maxAttempts) {
        return retryingRequest(options, attempt + 1);
      }
    }
    throw err;
  }
}

export default retryingRequest;
