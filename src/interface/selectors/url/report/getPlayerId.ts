import { getMatchWithPlayer } from './getMatch';

export const getPlayerIdFromParam = (param: string | null | undefined) => {
  if (param) {
    const playerId = Number(param.split('-')[0]);
    if (playerId) {
      return playerId;
    }
  }
  return null;
};

export default (pathname: string) => {
  const match = getMatchWithPlayer(pathname);
  return getPlayerIdFromParam(match?.params?.player);
};
