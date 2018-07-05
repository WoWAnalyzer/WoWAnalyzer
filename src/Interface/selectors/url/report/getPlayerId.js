import getMatch from './getMatch';

export default state => {
  const match = getMatch(state);
  if (match && match.params.player) {
    const playerId = Number(match.params.player.split('-')[0]);
    if (playerId) {
      return playerId;
    }
  }
  return null;
};
