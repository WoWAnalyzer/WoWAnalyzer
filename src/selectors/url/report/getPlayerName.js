import getMatch from './getMatch';

export default state => {
  const match = getMatch(state);
  if(match && match.params.player){
    return match.params.player.indexOf('-') > -1 ? match.params.player.split('-')[1] : match.params.player;
  }
  return null;
};
