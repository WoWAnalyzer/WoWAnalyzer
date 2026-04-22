import { getMatchWithPlayer } from './getMatch';

export const getPlayerNameFromParam = (param: string | null | undefined) => {
  if (param) {
    const player = param;
    const index = player.indexOf('-');
    const hasSeparator = index !== -1;
    const hasAnonSeparator = player.includes('+');
    if (hasSeparator) {
      return decodeURIComponent(player.substring(index + 1));
    }
    if (hasAnonSeparator) {
      // anonymous names don't need uri component decoding, since they're anonymous
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
