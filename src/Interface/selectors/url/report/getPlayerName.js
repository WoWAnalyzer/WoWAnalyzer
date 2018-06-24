import getMatch from './getMatch';

export default state => {
  const match = getMatch(state);
  if(match && match.params.player){
    const index = match.params.player.indexOf('-');
    return index !== -1 ? match.params.player.substr(index + 1) : match.params.player;
  }
  return null;
};
