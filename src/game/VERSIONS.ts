import Expansion from './Expansion';

// The current version of the game. Used to check spec patch compatibility and as a caching key.
const VERSIONS: Partial<{ [expansion in Expansion]: string }> = {
  [Expansion.TheBurningCrusade]: '2.5.1',
  [Expansion.Shadowlands]: '9.0.5',
};

export default VERSIONS;

export const WCL_GAME_VERSIONS: Partial<{ [expansion in Expansion]: number }> = {
  [Expansion.Shadowlands]: 1,
  [Expansion.Vanilla]: 2,
  [Expansion.TheBurningCrusade]: 3,
};

export const wclGameVersionToExpansion = (gameVersion: number): Expansion => {
  switch (gameVersion) {
    case 2:
      return Expansion.Vanilla;
    case 3:
      return Expansion.TheBurningCrusade;
    default:
      return Expansion.Shadowlands;
  }
};
