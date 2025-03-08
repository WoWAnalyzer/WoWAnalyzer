import { buildBoss } from '../builders';
import background from './backgrounds/Rik Reverb.jpg';

export default buildBoss({
  id: 3011,
  background,
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
