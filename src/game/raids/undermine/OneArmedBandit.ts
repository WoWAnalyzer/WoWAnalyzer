import { buildBoss } from '../builders';

export default buildBoss({
  id: 3014,
  name: 'One-Armed Bandit',
  timeline: {
    abilities: [
      {
        // Spin to Win -- summon adds
        id: 461060,
        type: 'cast',
      },
      {
        // Pay-line -- spawn coins
        id: 460181,
        type: 'cast',
      },
    ],
    debuffs: [
      {
        // Withering Flames
        id: 471927,
      },
      {
        // Explosive Gaze -- fixate
        id: 465009,
      },
      {
        // Token: Coin
        id: 472823,
      },
      {
        // Token: Shock
        id: 472783,
      },
      {
        // Token: Bomb
        id: 472837,
      },
      {
        // Token: Flame
        id: 472828,
      },
    ],
  },
});
