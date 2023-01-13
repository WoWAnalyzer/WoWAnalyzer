import { getReport } from 'interface/selectors/report';
import Report from 'parser/core/Report';
import { RootState } from 'store';

export const getFightFromReport = (report: Report, fightId: number) => {
  if (!report.fights) {
    return null;
  }
  return report.fights.find((fight) => fight.id === fightId) || null;
};
// TODO: Refactor below function away
export const getFightById = (state: RootState, fightId: number | null) => {
  const report = getReport(state);
  if (!report || !fightId) {
    return null;
  }
  return getFightFromReport(report, fightId);
};
