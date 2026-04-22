import background from './backgrounds/Beloren.jpg';
import { buildBoss } from 'game/raids/builders';

export const Beloren = buildBoss({
  background,
  id: 3182,
  name: "Belo'ren, Child of Al'ar",
  timeline: {
    abilities: [
      // Voidlight Convergence (color change)
      { id: 1242515, type: 'begincast' },
      // Tank cones
      { id: 1261217, type: 'cast' },
      { id: 1261218, type: 'cast' },
      { id: 1241678, type: 'cast' },
      // dives
      { id: 1241340, type: 'cast' },
      { id: 1241291, type: 'cast' },
    ],
    debuffs: [
      // quills
      { id: 1241992 },
      { id: 1242091 },
      // dives
      { id: 1241292 },
      { id: 1241339 },
    ],
  },
});
