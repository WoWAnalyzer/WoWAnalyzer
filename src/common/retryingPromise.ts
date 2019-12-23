import sleep from './sleep';

export const MAX_ATTEMPTS = 3;
const ATTEMPT_DELAY = 500;

export default async function retryingPromise<T>(
  retryable: () => T,
  attempt = 1,
  delay = ATTEMPT_DELAY,
): Promise<T> {
  try {
    return await retryable();
  } catch (err) {
    const isFatalError = err instanceof TypeError;
    if (isFatalError) {
      // Reject immediately if the error can not be recovered (e.g. syntax
      // errors). This is required when retrying bundle loading, as bundles lazy
      // imports will only fail on the first try, and "succeed" on others.
      throw err;
    }
    if (attempt >= MAX_ATTEMPTS) {
      throw err;
    }

    console.error(`An error occured, trying again in ${delay}ms`, err);
    await sleep(delay);
    return retryingPromise(retryable, attempt + 1, delay * 2);
  }
}
