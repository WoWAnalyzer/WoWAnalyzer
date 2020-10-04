import getMatch from './getMatch';

export default (pathname: string) => {
  const match = getMatch(pathname);
  return match ? match.params.build : null;
};
