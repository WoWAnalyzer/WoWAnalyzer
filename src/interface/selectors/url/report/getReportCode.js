import getMatch from './getMatch';

export default state => {
  const match = getMatch(state);
  return match ? match.params.reportCode : null;
};
