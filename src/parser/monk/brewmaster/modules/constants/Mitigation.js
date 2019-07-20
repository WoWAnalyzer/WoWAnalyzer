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

export const EP_K = [
  null,
  10275.3,
  null,
  11478.6,
  12782.7,
  14282.1,
]

export function diminish(stat, K) {
  return stat / (stat + K);
}

export function lookupK(fight) {
    if(fight.size === 5) {
      return MPLUS_K;
    } else {
      return EP_K[fight.difficulty];
    }
}
