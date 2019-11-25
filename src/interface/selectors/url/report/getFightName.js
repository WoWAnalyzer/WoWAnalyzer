import getFightParts from './getFightParts';

export default state => {
  const parts = getFightParts(state);
  if (parts) {
    const fightName = parts[1];
    if (fightName) {
      return fightName;
    }
  }
  return null;
};
