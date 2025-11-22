enum Expansion {
  Vanilla = 1,
  TheBurningCrusade = 2,
  WrathOfTheLichKing = 3,
  Cataclysm = 4,
  MistsOfPandaria = 5,
  WarlordsOfDraenor = 6,
  Legion = 7,
  BattleForAzeroth = 8,
  Shadowlands = 9,
  Dragonflight = 10,
  TheWarWithin = 11,
  Midnight = 12,
}

enum ExpansionName {
  // The value of `player.combatant.expansion`
  WrathOfTheLichKing = 'wotlk',
  Cataclysm = 'cataclysm',
  MistsOfPandaria = 'classic-mists', // PTR/beta logs say "unknown" unless they're re-exported
  Dragonflight = 'dragonflight',
  TheWarWithin = 'the war within',
  Midnight = 'midnight',
}

export const CLASSIC_EXPANSION = Expansion.MistsOfPandaria;
export const RETAIL_EXPANSION = Expansion.Midnight;

export const CLASSIC_EXPANSION_NAME = 'Mists of Pandaria';
export const RETAIL_EXPANSION_NAME = ExpansionName.Midnight;

export function isCurrentExpansion(expansion: Expansion): boolean {
  return expansion === CLASSIC_EXPANSION || expansion === RETAIL_EXPANSION;
}

export function isRetailExpansion(expansion: Expansion): boolean {
  return expansion >= Expansion.Legion;
}

export function isClassicExpansion(expansion: Expansion): boolean {
  // one day, we're going to have to deal with Classic Legion and things are going to get very messy
  return expansion >= Expansion.Vanilla && expansion <= Expansion.MistsOfPandaria;
}

export default Expansion;
