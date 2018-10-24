import getMatch from './getMatch';

export default state => {
  const match = getMatch(state);
  if (match && match.params.player) {
    const player = match.params.player;
    const index = player.indexOf('-');
    const hasSeparator = index !== -1;
    if (hasSeparator) {
      return player.substr(index + 1);
    }
    return null;
  }
  return null;
};
