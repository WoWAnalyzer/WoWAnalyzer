import getMatch from './getMatch';

export default state => {
  const match = getMatch(state);
  return match && match.params.fightId ? Number(match.params.fightId.split('-')[0]) : null;
};
