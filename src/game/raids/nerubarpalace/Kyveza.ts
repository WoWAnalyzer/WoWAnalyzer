import { buildBoss } from 'game/raids/builders';
import background from './backgrounds/Kyveza.jpg';

export const Kyveza = buildBoss({
  id: 2920,
  name: "Nexus-Princess Ky'veza",
  background,
  timeline: {
    debuffs: [
      { id: 437343 }, // Queensbane
      { id: 438141 }, // Twilight Massacre
      { id: 436870 }, // Assasination
    ],
    abilities: [
      {
        id: 440650,
        type: 'cast',
      }, // Assassination
      {
        id: 437620,
        type: 'cast',
      }, // Nether Rift
      {
        id: 438245,
        type: 'cast',
      }, // Twilight Massacre
      {
        id: 439576,
        type: 'cast',
        bossOnly: true,
      }, // Nexus Daggers
      {
        id: 435405,
        type: 'cast',
      }, // Starless Night
    ],
  },
});
