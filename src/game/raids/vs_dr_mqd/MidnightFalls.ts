import background from './backgrounds/MidnightFalls.jpg';
import { buildBoss } from 'game/raids/builders';

export const MidnightFalls = buildBoss({
  background,
  id: 3183,
  name: 'Midnight Falls',
  timeline: {
    abilities: [
      // glaive spawn
      { id: 1253915, type: 'cast' },
      // end of memory game (heroic)
      { id: 1249620, type: 'begincast' },
      // safeguard prism
      { id: 1251386, type: 'cast' },
      // into the darkwell (p2 start)
      { id: 1282043, type: 'cast' },
      // galvanize (p2 beams)
      { id: 1284528, type: 'cast' },
      // dark meltdown (p3 start)
      { id: 1281123, type: 'cast' },
      // severance (p3 mythic split)
      { id: 1275539, type: 'cast' },
      // Dark Archangel (p3 beam)
      { id: 1251331, type: 'cast' },
      // Termination Prism (mythic prisms)
      { id: 1284931, type: 'cast' },
      // end of memory game (mythic)
      { id: 1285708, type: 'begincast' },
      // Heaven & Hell (p4 beam)
      { id: 1276525, type: 'begincast' },
    ],
    debuffs: [
      // Dark Rune
      { id: 1249609 },
      // Galvanize (target)
      { id: 1284527 },
      // Glimmering
      { id: 1253031 },
      // Starsplinters (i1 blazes)
      { id: 1285510 },
      { id: 1279512 },
      // Criticality (p2 spreads)
      { id: 1281184 },
    ],
  },
});
