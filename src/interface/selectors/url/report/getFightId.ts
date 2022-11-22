import getFightParts, { getFightPartsFromParam } from './getFightParts';

export const getFightIdFromParam = (fight: string | undefined) => {
  const parts = getFightPartsFromParam(fight);
  if (parts) {
    const fightId = Number(parts[0]);
    if (fightId) {
      return fightId;
    }
  }
  return null;
};

export default (pathname: string) => {
  const parts = getFightParts(pathname);
  if (parts) {
    const fightId = Number(parts[0]);
    if (fightId) {
      return fightId;
    }
  }
  return null;
};
