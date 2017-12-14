import { getReport } from './report';

export const getFightById = (state, fightId) => {
  const report = getReport(state);
  if (!report || !report.fights) {
    return null;
  }
  return report.fights.find(fight => fight.id === fightId);
};
