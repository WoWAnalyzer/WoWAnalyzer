import { buildBoss } from '../builders';
import background from './backgrounds/Loomithar.jpg';

export default buildBoss({
  id: 3131,
  name: "Loom'ithar",
  background,
  timeline: {
    abilities: [
      {
        id: 1227263, // Piercing Strand (tank beam),
        type: 'cast',
      },
      {
        id: 1237272, // Lair Weaving (ring spawn)
        type: 'cast',
      },
      {
        id: 1227226, // Writhing Wave (p2 frontal)
        type: 'cast',
      },
      {
        id: 1227784, // Arcane Outrage
        type: 'cast',
      },
    ],
    debuffs: [
      {
        id: 1226311, // Infusion Tether
      },
      {
        id: 1227784, // Arcane Outrage
      },
    ],
  },
});
