import request from 'request-promise-native';
import { RequestError } from 'request-promise-native/errors';

import timeout from './timeout';

const defaultOptions = {
  maxAttempts: 3,
  reattemptDelay: 300,
  shouldRetry: err => err instanceof RequestError,
};

async function retryingRequest(options, attempt = 1) {
  try {
    console.debug('REQUEST', options.url);
    return await request.get(options);
  } catch (err) {
    console.debug('REQUEST', 'ERROR', err.message);
    const shouldRetry = options.shouldRetry || defaultOptions.shouldRetry;
    if (shouldRetry(err)) {
      const maxAttempts = options.maxAttempts || defaultOptions.maxAttempts;
      if (attempt < maxAttempts) {
        const reattemptDelay = options.reattemptDelay || defaultOptions.reattemptDelay;
        console.debug('REQUEST', 'Retrying in', reattemptDelay);
        await timeout(reattemptDelay);
        return retryingRequest(options, attempt + 1);
      }
    }
    throw err;
  }
}

export default retryingRequest;
