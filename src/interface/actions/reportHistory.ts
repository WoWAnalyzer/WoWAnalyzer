export interface ReportHistoryEntry {
  code: string;
  title?: string;
  start?: number;
  end: number;
  fightId?: number;
  fightName?: string;
  playerId?: number;
  playerName: string;
  playerRealm?: string;
  playerRegion?: string;
  playerClass: string;
  type: number;
}

export const APPEND_REPORT_HISTORY = 'APPEND_REPORT_HISTORY';
export function appendReportHistory(report: ReportHistoryEntry) {
  return {
    type: APPEND_REPORT_HISTORY,
    payload: report,
  };
}
