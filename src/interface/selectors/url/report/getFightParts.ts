import getMatch from './getMatch';

export default (pathname: string) => {
  const match = getMatch(pathname);
  if (match && match.params.fightId) {
    return match.params.fightId.split('-');
  }
  return null;
};
