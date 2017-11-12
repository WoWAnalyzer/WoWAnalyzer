import fetchWcl from 'common/fetchWcl';

export const SET_REPORT = 'SET_REPORT';
export function setReport(report) {
  return {
    type: SET_REPORT,
    payload: report,
  };
}
export function fetchReport(code, refresh = false) {
  return async dispatch => {
    dispatch(setReport(null));
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
    // TODO: Verify the current code is still the one we want by comparing it with the currently requested code in the store

    if (!json.fights) {
      throw new Error('Corrupt WCL response received.');
    }

    dispatch(setReport({
      ...json,
      code,
    }));
  };
}
