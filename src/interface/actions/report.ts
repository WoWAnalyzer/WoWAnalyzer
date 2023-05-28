import Report from 'parser/core/Report';

export const SET_REPORT = 'SET_REPORT';
export function setReport(report: Report | null) {
  return {
    type: SET_REPORT,
    payload: report,
  };
}
