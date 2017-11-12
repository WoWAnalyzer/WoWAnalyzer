import fetchWcl, { ApiDownError, LogNotFoundError } from 'common/fetchWcl';

import { setError } from './error';

export const SET_REPORT = 'SET_REPORT';
export function setReport(report) {
  return {
    type: SET_REPORT,
    payload: report,
  };
}
export function fetchReport(code, refresh = false) {
  return async (dispatch, getState) => {
    dispatch(setReport(null));
    try {
      let json = await fetchWcl(`report/fights/${code}`, {
        _: refresh ? +new Date() : undefined,
        translate: true, // so long as we don't have the entire site localized, it's better to have 1 consistent language
      });
      if (!json.fights) {
        // Give it one more try with cache busting on, usually hits the spot.
        json = await fetchWcl(`report/fights/${code}`, {
          _: +new Date(),
          translate: true, // so long as we don't have the entire site localized, it's better to have 1 consistent language
        });
      }
      const currentReportCode = getReportCode(getState());
      if (currentReportCode !== code) {
        // If the user already changed his mind and wants another report ignore this result.
        return;
      }

      if (!json.fights) {
        throw new Error('Corrupt WCL response received.');
      }

      dispatch(setReport({
        ...json,
        code,
      }));
    } catch (err) {
      if (err instanceof ApiDownError || err instanceof LogNotFoundError) {
        dispatch(setError(err));
      } else {
        Raven && Raven.captureException(err); // eslint-disable-line no-undef
        alert(`I'm so terribly sorry, an error occured. Try again later, in an updated Google Chrome and make sure that Warcraft Logs is up and functioning properly. Please let us know on Discord if the problem persists.\n\n${err}`);
        console.error(err);
      }
    }
  };
}
