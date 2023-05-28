import { getMatchWithBuild } from './getMatch';

const getBuild = (pathname: string) => {
  const match = getMatchWithBuild(pathname);
  return match ? match.params.build : null;
};

export default getBuild;
