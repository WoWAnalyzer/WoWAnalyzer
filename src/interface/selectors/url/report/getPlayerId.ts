export const getPlayerIdFromParam = (param: string | null | undefined) => {
  if (param) {
    const playerId = Number(param.split('-')[0]);
    if (playerId) {
      return playerId;
    }
  }
  return null;
};
