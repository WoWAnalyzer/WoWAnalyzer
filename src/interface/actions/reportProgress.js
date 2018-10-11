export const SET_REPORT_PROGRESS = 'SET_REPORT_PROGRESS';
export function setReportProgress(progress) {
  return {
    type: SET_REPORT_PROGRESS,
    payload: progress,
  };
}
