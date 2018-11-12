import request from 'helpers/request';
import RequestError from 'helpers/request/RequestError';

import sleep from './sleep';

const defaultOptions = {
  maxAttempts: 3,
  reattemptDelay: 300,
  shouldRetry: err => err instanceof RequestError,
  onBeforeAttempt: null,
  onSuccess: null,
  onFailure: null,
};

async function retryingRequest(options, attempt = 1) {
  try {
    // console.debug('REQUEST', options.url);
    if (options.onBeforeAttempt) {
      options.onBeforeAttempt(attempt);
    }
    const result = await request.get(options);
    if (options.onSuccess) {
      options.onSuccess(result, attempt);
    }

    return result;
  } catch (err) {
    // console.debug('REQUEST', 'ERROR', err.message);
    if (options.onFailure) {
      options.onFailure(err, attempt);
    }
    const shouldRetry = options.shouldRetry || defaultOptions.shouldRetry;
    if (shouldRetry(err)) {
      const maxAttempts = options.maxAttempts || defaultOptions.maxAttempts;
      if (attempt < maxAttempts) {
        const reattemptDelay = options.reattemptDelay || defaultOptions.reattemptDelay;
        // console.debug('REQUEST', 'Retrying in', reattemptDelay);
        await sleep(reattemptDelay);
        return retryingRequest(options, attempt + 1);
      }
    }
    throw err;
  }
}

export default retryingRequest;
