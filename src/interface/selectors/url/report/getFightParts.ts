import { getMatchWithFightId } from './getMatch';

export const getFightPartsFromParam = (fightId: string | null | undefined) =>
  fightId ? fightId.split('-') : null;

export default (pathname: string) => {
  const match = getMatchWithFightId(pathname);
  return getFightPartsFromParam(match?.params?.fightId);
};
