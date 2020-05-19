import retryingPromise, { MAX_ATTEMPTS } from './retryingPromise';

describe('retryingPromise', () => {
  function makeTimersInstant() {
    global.oldSetTimeout = global.setTimeout;
    global.setTimeout = jest.fn(func => global.oldSetTimeout(func, 0));
  }
  function resetTimers() {
    if (global.oldSetTimeout) {
      global.setTimeout = global.oldSetTimeout;
      global.oldSetTimeout = undefined;
    }
  }
  beforeEach(() => {
    makeTimersInstant();
    console.error = jest.fn();
  });
  afterEach(resetTimers);
  it('resolves a Promise and returns its return value', async () => {
    expect.assertions(1);
    const returnValue = {};
    const result = await retryingPromise(() => Promise.resolve(returnValue));
    expect(result).toBe(returnValue);
  });
  it('tries the maximum amount of times', async () => {
    expect.assertions(1);
    let call = 0;
    try {
      await retryingPromise(() => {
        call += 1;
        return Promise.reject();
      });
    } catch (e) {
      // not relevant to test
    }
    expect(call).toBe(MAX_ATTEMPTS);
  });
  it('after failing a Promise, it will return the value of a successful Promise', async () => {
    expect.assertions(1);
    const returnValue = {};
    let call = 0;
    // eslint-disable-next-line no-plusplus
    const result = await retryingPromise(() => call++ === 0 ? Promise.reject() : Promise.resolve(returnValue));
    expect(result).toBe(returnValue);
  });
  it('gives up and returns the last error if it can\'t be resolved', async () => {
    expect.assertions(1);
    const returnError = new Error('Something happened');
    try {
      await retryingPromise(() => Promise.reject(returnError));
    } catch (err) {
      expect(err).toEqual(returnError);
    }
  });
  it('delays successive attempts', async () => {
    expect.assertions(2);
    try {
      await retryingPromise(() => Promise.reject());
    } catch (e) {
      // not relevant to test
    }

    const timings = global.setTimeout.mock.calls.map(call => call[1]);
    // This test only works if the max attempts is 3, otherwise we need to add timings
    expect(MAX_ATTEMPTS).toBe(3);
    // The delay is only called twice, making a total of 3 calls (at 0ms delay, 500ms, and 1000ms)
    expect(timings).toEqual([500, 1000]);
  });
});
