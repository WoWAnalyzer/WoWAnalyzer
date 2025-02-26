import { buildBoss } from '../builders';
import Background from './backgrounds/Vexie.jpg';

export default buildBoss({
  id: 3009,
  name: 'Vexie and the Geargrinders',
  background: Background,
  timeline: {
    abilities: [
      {
        // Summon Bikers
        id: 459943,
        type: 'cast',
      },
    ],
    debuffs: [
      {
        // Spew Oil -- spawns oil slick
        id: 459678,
        type: 'debuff',
      },
      {
        // Incendiary Fire
        id: 468216,
        type: 'debuff',
      },
      {
        // Riding the Bike
        id: 459445,
      },
    ],
  },
});
