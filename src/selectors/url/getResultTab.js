import getMatch from './getMatch';

export default state => {
  const match = getMatch(state);
  return match ? match.params.resultTab : null;
};
