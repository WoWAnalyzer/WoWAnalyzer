import getMatch from './getMatch';

export default state => {
  const match = getMatch(state);
  if (match && match.params.fightId) {
    const fightId = Number(match.params.fightId.split('-')[0]);
    if (fightId) {
      return fightId;
    }
  }
  return null;
};
