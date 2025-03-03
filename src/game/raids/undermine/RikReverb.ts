import { buildBoss } from '../builders';

export default buildBoss({
  id: 3011,
  name: 'Rik Reverb',
  timeline: {
    abilities: [
      {
        // Sound Cannon
        id: 467606,
        type: 'begincast',
      },
      {
        // Amplification!
        id: 473748,
        type: 'begincast',
      },
    ],
    debuffs: [
      {
        // Entranced
        id: 1214598,
      },
    ],
  },
});
