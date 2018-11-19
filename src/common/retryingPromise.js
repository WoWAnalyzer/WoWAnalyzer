import sleep from './sleep';

export const MAX_ATTEMPTS = 3;
const ATTEMPT_DELAY = 500;

export default function retryingPromise(retryable, attempt = 1, delay = ATTEMPT_DELAY) {
  return retryable().catch(err => {
    // TODO: Reject also when the err can not be recovered (e.g. a coding error: TypeError). This is important when a CombatLogParser module has a coding error, it will fail to load in this method but this method will try again even though it can't and is pointless. Do we whitelist or blacklist? Not an easy call.
    if (attempt >= MAX_ATTEMPTS) {
      return Promise.reject(err);
    }

    console.error(`An error occured, trying again in ${delay}ms`, err);
    return sleep(delay).then(() => retryingPromise(retryable, attempt + 1, delay * 2));
  });
}
