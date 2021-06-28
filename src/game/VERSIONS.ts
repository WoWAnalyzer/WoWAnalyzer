import Expansion from './Expansion';

// The current version of the game. Used to check spec patch compatibility and as a caching key.
const VERSIONS: Partial<{ [expansion in Expansion]: string }> = {
  [Expansion.TheBurningCrusade]: '2.5.1',
  [Expansion.Shadowlands]: '9.0.1',
};

export default VERSIONS;
