import background from './backgrounds/VaelgorEzzorak.jpg';
import { buildBoss } from 'game/raids/builders';

export const VaelgorEzzorak = buildBoss({
  background,
  id: 3178,
  name: 'Vaelgor & Ezzorak',
  timeline: {
    abilities: [
      // Dread Breath
      { id: 1244221, type: 'cast' },
      // Gloom
      { id: 1245391, type: 'cast' },
      // Void Howl (orb spawns)
      { id: 1244917, type: 'cast' },
      // Nullbeam
      { id: 1262623, type: 'cast' },
      // Midnight Flames
      { id: 1249748, type: 'begincast' },
    ],
    debuffs: [
      // Dread Breath (target)
      { id: 1255612, type: 'debuff' },
      // Dread Breath (fear)
      { id: 1255979 },
      // Nullzone (tether)
      { id: 1244672 },
      // Shadowmark
      { id: 1270497 },
    ],
  },
});
