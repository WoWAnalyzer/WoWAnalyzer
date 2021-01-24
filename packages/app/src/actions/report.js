export const SET_REPORT = 'SET_REPORT';
export function setReport(report) {
  return {
    type: SET_REPORT,
    payload: report,
  };
}
