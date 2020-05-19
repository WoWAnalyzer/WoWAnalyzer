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

// not necessarily the first boss, but the one with the lowest id
const BOD_FIRST_BOSS = 2263;
export const BOD_K = [
     null,
   8467.2, // LFR
     null,
   9311.4, // Normal
  10275.3, // Heroic
  11390.4, // Mythic
];

const EP_FIRST_BOSS = 2289;
export const EP_K = [
  null,
  10275.3,
  null,
  11478.6,
  12782.7,
  14282.1,
];

const NYALOTHA_FIRST_BOSS = 2327;
export const NYALOTHA_K = [
  null,
  12782.7,
  null,
  14282.1,
  16002.0,
  17986.5,
];

export function diminish(stat, K) {
  return stat / (stat + K);
}

export function lookupK(fight) {
    if(fight.size === 5) {
      return MPLUS_K;
    } else if (fight.boss >= NYALOTHA_FIRST_BOSS) {
      return NYALOTHA_K[fight.difficulty];
    } else if (fight.boss >= EP_FIRST_BOSS) {
      return EP_K[fight.difficulty];
    } else if (fight.boss >= BOD_FIRST_BOSS) {
      return BOD_K[fight.difficulty];
    } else {
      return ULDIR_K[fight.difficulty];
    }
}
