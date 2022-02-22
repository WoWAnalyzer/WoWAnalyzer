import getMatch from './getMatch';

const getBuild = (pathname: string) => {
  const match = getMatch(pathname);
  return match ? match.params.build : null;
};

export default getBuild;
