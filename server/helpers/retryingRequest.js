import request from 'helpers/request';
import RequestError from 'helpers/request/RequestError';

import sleep from './sleep';

const defaultOptions = {
  maxAttempts: 3,
  reattemptDelay: 300,
  shouldRetry: err => err instanceof RequestError,
  onBeforeAttempt: null,
  onSuccess: null,
  onFailedAttempt: null,
};

async function retryingRequest(options, attempt = 1) {
  try {
    if (options.onBeforeAttempt) {
      options.onBeforeAttempt(attempt);
    }

    const start = Date.now();
    console.debug('REQUEST', `attempt #${attempt}`, `GET ${options.url}`);
    const result = await request.get(options);
    const responseTime = Date.now() - start;
    console.debug('REQUEST', 'finished', options.url, 'response time:', responseTime, 'ms');
    if (options.onSuccess) {
      options.onSuccess(result, attempt);
    }

    return result;
  } catch (err) {
    console.error('REQUEST', 'ERROR', err.toString(), err.message);
    if (options.onFailedAttempt) {
      options.onFailedAttempt(err, attempt);
    }

    const shouldRetry = options.shouldRetry || defaultOptions.shouldRetry;
    if (shouldRetry(err)) {
      const maxAttempts = options.maxAttempts || defaultOptions.maxAttempts;
      if (attempt < maxAttempts) {
        const reattemptDelay = options.reattemptDelay || defaultOptions.reattemptDelay;
        await sleep(reattemptDelay);
        return retryingRequest(options, attempt + 1);
      }
    }
    throw err;
  }
}

export default retryingRequest;
