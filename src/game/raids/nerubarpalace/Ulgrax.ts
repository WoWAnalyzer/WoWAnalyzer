import { buildBoss } from 'game/raids/builders';

export const Ulgrax = buildBoss({
  id: 2902,
  name: 'Ulgrax the Devourer',
  timeline: {
    abilities: [
      {
        // Carnivorous Contest
        type: 'cast',
        id: 434803,
      },
    ],
    debuffs: [
      {
        // Hardened Netting (the avoidable stun)
        id: 455831,
      },
      {
        // Carnivorous Contest (the pull in part) -- don't see a "you are placing the circle" debuff in the log
        id: 457668,
      },
      {
        // Chunky Viscera (for feeding the boss)
        id: 438657,
      },
    ],
  },
});
