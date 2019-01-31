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

export const MPLUS_K = 8467.2;

export const BOD_K = [
     null,
   8467.2, // LFR
     null,
   9311.4, // Normal
  10275.3, // Heroic
  11390.4, // Mythic
];

export function diminish(stat, K) {
  return stat / (stat + K);
}

export function lookupK(fight) {
    if(fight.size === 5) {
      return MPLUS_K;
    } else {
      return BOD_K[fight.difficulty];
    }
}
