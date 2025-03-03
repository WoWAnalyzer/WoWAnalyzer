import { buildBoss } from 'game/raids/builders';
import background from './backgrounds/Ovinax.jpg';

export const Ovinax = buildBoss({
  id: 2919,
  name: "Broodtwister Ovi'nax",
  background,
  timeline: {
    abilities: [
      {
        // Ingest Black Blood (transitions)
        id: 442432,
        type: 'begincast',
      },
      {
        // Experimental Dosage (egg break)
        id: 442526,
        type: 'cast',
      },
    ],
    debuffs: [
      {
        // Volatile Concoction (tank debuff)
        id: 441362,
      },
      {
        // Sticky Webs
        id: 446349,
      },
      {
        // Web Eruption (root)
        id: 446351,
      },
      {
        // Experimental Dosage (egg break)
        id: 440421,
      },
    ],
  },
});
