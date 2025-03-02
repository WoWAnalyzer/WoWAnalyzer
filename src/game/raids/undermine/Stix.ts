import { buildBoss } from '../builders';
import Background from './backgrounds/Stix.jpg';

export default buildBoss({
  id: 3012,
  name: 'Stix Bunkjunker',
  background: Background,
  timeline: {
    debuffs: [
      {
        // Rolling Rubbish
        id: 461536,
      },
      {
        // Sorted (pre-ball debuff)
        id: 465346,
      },
      {
        // Incineration
        id: 472893,
      },
    ],
    abilities: [
      {
        // Electromagnetic Sorting (spawn adds + balls)
        id: 464399,
        type: 'begincast',
      },
      {
        // Overdrive
        id: 467117,
        type: 'cast',
      },
      {
        // Trash Compactor (end overdrive)
        id: 467109,
        type: 'cast',
      },
    ],
  },
});
