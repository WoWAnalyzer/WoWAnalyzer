import background from './backgrounds/Chimaerus.jpg';
import { buildBoss } from 'game/raids/builders';

export const Chimaerus = buildBoss({
  background,
  id: 3306,
  name: 'Chimaerus the Undreamt God',
  timeline: {
    abilities: [
      // Alndust Upheaval (group soak)
      { id: 1262289, type: 'cast' },
      // Rift Madness
      { id: 1264756, type: 'cast' },
      // Rift Emergence (summon adds)
      { id: 1258610, type: 'cast' },
      // Consume
      { id: 1245396, type: 'begincast' },
      // Ravenous Dive
      { id: 1245406, type: 'cast' },
    ],
    debuffs: [
      // Alndust Upheaval (group soak target)
      { id: 1246149 },
      // Consuming Miasma (dispel debuff)
      { id: 1257087 },
      // Rift Madness (target)
      { id: 1264756 },
      // Rift Madness (horrify)
      { id: 1264757 },
    ],
  },
});
