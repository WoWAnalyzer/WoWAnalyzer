import Report from 'parser/core/Report';

export const APPEND_REPORT_HISTORY = 'APPEND_REPORT_HISTORY';
export function appendReportHistory(report: Report) {
  return {
    type: APPEND_REPORT_HISTORY,
    payload: report,
  };
}
