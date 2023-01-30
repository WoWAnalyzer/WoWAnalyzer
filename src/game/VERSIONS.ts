import Expansion from './Expansion';

// The current version of the game. Used to check spec patch compatibility and as a caching key.
const VERSIONS: Partial<{ [expansion in Expansion]: string }> = {
  [Expansion.WrathOfTheLichKing]: '3.4.0',
  [Expansion.Dragonflight]: '10.0.5',
};

export default VERSIONS;

export const WCL_GAME_VERSIONS: Partial<{ [expansion in Expansion]: number }> = {
  [Expansion.Dragonflight]: 1,
  [Expansion.Vanilla]: 2,
  [Expansion.TheBurningCrusade]: 3,
  [Expansion.WrathOfTheLichKing]: 4,
};

export const wclGameVersionToExpansion = (gameVersion: number): Expansion => {
  switch (gameVersion) {
    case 2:
      return Expansion.Vanilla;
    case 3:
      return Expansion.TheBurningCrusade;
    case 4:
      return Expansion.WrathOfTheLichKing;
    default:
      return Expansion.Dragonflight;
  }
};

export const isUnsupportedClassicVersion = (gameVersion: number): boolean => {
  return gameVersion === 2 || gameVersion === 3;
};
