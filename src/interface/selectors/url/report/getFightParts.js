import getMatch from './getMatch';

export default state => {
  const match = getMatch(state);
  if (match && match.params.fightId) {
    return match.params.fightId.split('-');
  }
  return null;
};
