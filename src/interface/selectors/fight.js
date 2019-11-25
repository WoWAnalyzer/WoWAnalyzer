import { getReport } from './report';

export const getFightFromReport = (report, fightId) => {
  if (!report || !report.fights) {
    return null;
  }
  return report.fights.find(fight => fight.id === fightId);
};
// TODO: Refactor below function away
export const getFightById = (state, fightId) => {
  const report = getReport(state);
  return getFightFromReport(report, fightId);
};
