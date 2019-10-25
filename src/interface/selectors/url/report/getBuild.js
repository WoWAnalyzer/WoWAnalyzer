import getMatch from './getMatch';

export default state => {
  const match = getMatch(state);
  console.log(match.params.build);
  return match ? match.params.build : null;
};
