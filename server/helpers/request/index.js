import requestPromise from 'request-promise-native';
import RequestError from './RequestError';
import RequestTimeoutError from './RequestTimeoutError';
import RequestConnectionResetError from './RequestConnectionResetError';
import RequestSocketTimeoutError from './RequestSocketTimeoutError';
import RequestUnknownError from './RequestUnknownError';

export default {
  get: async function get(options) {
    try {
      return await requestPromise.get(options);
    } catch(err) {
      if (err instanceof RequestError) {
        // An error occured connecting or during the transmission
        const code = err.error.code;
        switch (code) {
          case 'ETIMEDOUT':
            throw new RequestTimeoutError();
          case 'ECONNRESET':
            throw new RequestConnectionResetError();
          case 'ESOCKETTIMEDOUT':
            throw new RequestSocketTimeoutError();
          default:
            throw new RequestUnknownError();
        }
      }
      throw err;
    }
  },
};
