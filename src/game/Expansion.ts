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
}

enum ExpansionName {
  // The value of `player.combatant.expansion`
  WrathOfTheLichKing = 'wotlk',
  Cataclysm = 'cataclysm',
  Dragonflight = 'dragonflight',
  TheWarWithin = 'the war within',
}

export const CLASSIC_EXPANSION = Expansion.Cataclysm;
export const RETAIL_EXPANSION = Expansion.TheWarWithin;

export const CLASSIC_EXPANSION_NAME = ExpansionName.Cataclysm;
export const RETAIL_EXPANSION_NAME = ExpansionName.TheWarWithin;

export function isCurrentExpansion(expansion: Expansion): boolean {
  return expansion === CLASSIC_EXPANSION || expansion === RETAIL_EXPANSION;
}

export function isRetailExpansion(expansion: Expansion): boolean {
  return expansion >= Expansion.Legion;
}

export function isClassicExpansion(expansion: Expansion): boolean {
  // one day, we're going to have to deal with Classic Legion and things are going to get very messy
  return expansion >= Expansion.Vanilla && expansion <= Expansion.Cataclysm;
}

export default Expansion;
