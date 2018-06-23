import fetchWcl, { CorruptResponseError } from 'common/fetchWcl';

export const SET_REPORT = 'SET_REPORT';
export function setReport(report) {
  return {
    type: SET_REPORT,
    payload: report,
  };
}

function fetchFights(code, refresh = false) {
  return fetchWcl(`report/fights/${code}`, {
    _: refresh ? +new Date() : undefined,
    translate: true, // so long as we don't have the entire site localized, it's better to have 1 consistent language
  });
}

export function fetchReport(code, refresh = false) {
  return async dispatch => {
    dispatch(setReport(null));
    // await timeout(15000);
    let json = await fetchFights(code, refresh);
    if (!json.fights) {
      // This is a relatively common WCL bug. Give it one more try with cache busting on, usually hits the spot.
      json = await fetchFights(code, true);
    }
    // TODO: Verify the current code is still the one we want by comparing it with the currently requested code in the store

    if (!json.fights) {
      throw new CorruptResponseError();
    }

    const report = {
      ...json,
      code,
    };

    dispatch(setReport(report));
    return report;
  };
}
