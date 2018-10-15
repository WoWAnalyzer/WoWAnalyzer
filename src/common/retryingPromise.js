import sleep from './sleep';

export const MAX_ATTEMPTS = 3;
const ATTEMPT_DELAY = 500;

export default function retryingPromise(retryable, attempt = 1, delay = ATTEMPT_DELAY) {
  return retryable().catch(err => {
    if (attempt >= MAX_ATTEMPTS) {
      return Promise.reject(err);
    }

    console.error(`An error occured, trying again in ${delay}ms`, err);
    return sleep(delay).then(() => retryingPromise(retryable, attempt + 1, delay * 2));
  });
}
