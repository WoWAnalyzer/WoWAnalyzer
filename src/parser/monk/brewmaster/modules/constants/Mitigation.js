// K is a constant that attenuates the diminishing return formula,
// giving lower damage reduction on higher difficulties.
export const ULDIR_K = [
  null, // unknown difficulty
  6300, // LFR --- using world K
  null, // unknown
  7736.4, // Normal
  8467.2, // Heroic
  9311.4, // Mythic
];

export const MPLUS_K = 7100.1;

export function diminish(stat, K) {
  return stat / (stat + K);
}
