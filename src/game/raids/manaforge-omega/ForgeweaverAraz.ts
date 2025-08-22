import { buildBoss } from '../builders';
import background from './backgrounds/ForgeweaverAzar.jpg';

export default buildBoss({
  id: 3132,
  name: 'Forgeweaver Araz',
  background,
  timeline: {
    abilities: [
      {
        id: 1228216, // Arcane Obliteration
        type: 'cast',
      },
      {
        id: 1230529, // Mana Sacrifice (damage amp start)
        type: 'cast',
      },
      {
        id: 1231720, // Invoke Collector
        type: 'cast',
      },
    ],
    debuffs: [
      {
        id: 1233979, // Astral Harvest (target pt 1)
      },
      {
        id: 1228214, // Astral Harvest (target pt 2)
      },
      {
        id: 1228188, // Silencing Tempest (target debuff)
      },
    ],
  },
});
