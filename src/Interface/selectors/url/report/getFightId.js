import getFightParts from './getFightParts';

export default state => {
  const parts = getFightParts(state);
  if (parts) {
    const fightId = Number(parts[0]);
    if (fightId) {
      return fightId;
    }
  }
  return null;
};
