import getMatch from './getMatch';

export default state => {
  const match = getMatch(state);
  return match ? decodeURI(match.params.id.replace(/\+/g, ' ')) : null;
};
