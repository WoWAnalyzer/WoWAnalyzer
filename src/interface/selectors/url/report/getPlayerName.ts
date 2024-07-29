import { getMatchWithPlayer } from './getMatch';

export const getPlayerNameFromParam = (param: string | null | undefined) => {
  if (param) {
    const player = param;
    const index = player.indexOf('-');
    const hasSeparator = index !== -1;
    const hasAnonSeparator = player.includes('+');
    if (hasSeparator) {
      return player.substr(index + 1);
    }
    if (hasAnonSeparator) {
      return player.replace('+', ' ');
    }
    if (!Number.isInteger(player)) {
      return decodeURIComponent(player);
    }
    return null;
  }
  return null;
};

export default (pathname: string) => {
  const match = getMatchWithPlayer(pathname);
  return getPlayerNameFromParam(match?.params?.player);
};
