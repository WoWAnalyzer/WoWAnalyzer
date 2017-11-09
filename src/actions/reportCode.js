export const SET_REPORT_CODE = 'SET_REPORT_CODE';
export function setReportCode(reportCode) {
  return {
    type: SET_REPORT_CODE,
    payload: reportCode,
  };
}
