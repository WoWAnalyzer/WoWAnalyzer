import { createMatchSelector } from 'react-router-redux';

// Not sure this is the right place to define this, but for now it allows us these selectors anywhere in the code
const getMatch = createMatchSelector('/report/:reportCode?/:fightId?/:playerName?/:resultTab?');
export const getReportCode = state => {
  const match = getMatch(state);
  return match ? match.params.reportCode : null;
};
export const getFightId = state => {
  const match = getMatch(state);
  return match && match.params.fightId ? Number(match.params.fightId.split('-')[0]) : null;
};
export const getPlayerName = state => {
  const match = getMatch(state);
  return match ? match.params.playerName : null;
};
export const getResultTab = state => {
  const match = getMatch(state);
  return match ? match.params.resultTab : null;
};
