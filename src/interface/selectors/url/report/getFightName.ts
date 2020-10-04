import getFightParts from './getFightParts';

export default (pathname: string) => {
  const parts = getFightParts(pathname);
  if (parts) {
    const fightName = parts[1];
    if (fightName) {
      return fightName;
    }
  }
  return null;
};
