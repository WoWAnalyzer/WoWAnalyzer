import { buildBoss } from '../builders';
import Background from './backgrounds/Cauldron.jpg';

export default buildBoss({
  id: 3010,
  name: 'Cauldron of Carnage',
  background: Background,
  timeline: {
    abilities: [
      {
        // Scrapbomb
        id: 473650,
        type: 'cast',
      },
    ],
    debuffs: [
      {
        // Voltaic Image fixate
        id: 1214009,
      },
      {
        // Molten Phlegm spread debuff
        id: 1213690,
      },
    ],
  },
});
