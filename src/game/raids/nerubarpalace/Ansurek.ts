import { buildBoss } from 'game/raids/builders';
import background from './backgrounds/Ansurek.jpg';

export const Ansurek = buildBoss({
  id: 2922,
  name: 'Queen Ansurek',
  background,
  timeline: {
    abilities: [
      { id: 440899, type: 'cast' }, // Liquify
      { id: 437417, type: 'begincast' }, // Venom Nova
      { id: 447411, type: 'begincast' }, // Wrest (intermission)
      { id: 450191, type: 'begincast' }, // Wrest (P2)
      { id: 445422, type: 'begincast' }, // Frothing Gluttony (P3 ring)
      { id: 443325, type: 'cast' }, // Infest
      { id: 438976, type: 'cast' }, // Royal Condemnation
    ],
    debuffs: [
      { id: 451278 }, // Concentrated Toxin (P1 button push bomb)
      { id: 437586 }, // Reactive Toxin (P1 button placement)
      { id: 443903 }, // Abyssal Infusion (P3 portal placement)
      { id: 445152 }, // Acolyte's Essence (P3 essences)
      { id: 443656 }, // Infest (P3 spider placement)
      { id: 438974 }, // Royal Condemnation (P3 shackle placement)
      { id: 439829 }, // Silken Tomb (root, not pre-debuff)
    ],
  },
});
