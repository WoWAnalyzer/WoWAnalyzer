import Expansion from './Expansion';
import GameBranch from './GameBranch';

// The current version of the game. Used to check spec patch compatibility and as a caching key.
const VERSIONS: { [branch in GameBranch]: string } = {
  [GameBranch.Classic]: '4.4.0',
  [GameBranch.Retail]: '11.1.0',
};

export default VERSIONS;

export const wclGameVersionToExpansion = (gameVersion: number): Expansion => {
  switch (gameVersion) {
    case 2:
      return Expansion.Vanilla;
    case 3:
      return Expansion.TheBurningCrusade;
    case 4:
      return Expansion.WrathOfTheLichKing;
    case 5:
      return Expansion.Cataclysm;
    default:
      return Expansion.TheWarWithin;
  }
};

export const wclGameVersionToBranch = (gameVersion: number): GameBranch => {
  if (gameVersion === 1) {
    return GameBranch.Retail;
  } else {
    return GameBranch.Classic;
  }
};

export const isUnsupportedClassicVersion = (gameVersion: number): boolean => {
  return gameVersion > 1 && gameVersion < 5;
};
