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
}

export default Expansion;

export const CLASSIC_EXPANSION = Expansion.WrathOfTheLichKing;
export const RETAIL_EXPANSION = Expansion.Dragonflight;

export function isCurrentExpansion(expansion: Expansion): boolean {
  return expansion === CLASSIC_EXPANSION || expansion === RETAIL_EXPANSION;
}

export function isRetailExpansion(expansion: Expansion): boolean {
  return expansion >= Expansion.Legion;
}

export function isClassicExpansion(expansion: Expansion): boolean {
  return expansion >= Expansion.Vanilla && expansion <= Expansion.WrathOfTheLichKing;
}
