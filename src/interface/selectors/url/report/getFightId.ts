import getFightParts from './getFightParts';

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
