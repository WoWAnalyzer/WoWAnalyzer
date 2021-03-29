export const APPEND_REPORT_HISTORY = 'APPEND_REPORT_HISTORY';
export function appendReportHistory(report: any) {
  return {
    type: APPEND_REPORT_HISTORY,
    payload: report,
  };
}
