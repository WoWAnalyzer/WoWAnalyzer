import background from './backgrounds/LightblindedVanguard.jpg';
import { buildBoss } from 'game/raids/builders';

export const LightblindedVanguard = buildBoss({
  background,
  id: 3180,
  name: 'Lightblinded Vanguard',
  timeline: {
    abilities: [
      // Aura of Devotion
      { id: 1246162, type: 'begincast' },
      // elephant
      { id: 1249130, type: 'cast' },
      // Aura of Wrath
      { id: 1248449, type: 'begincast' },
      // Aura of Peace
      { id: 1248451, type: 'begincast' },
    ],
    debuffs: [
      // Judgment (Venel)
      { id: 1246736 },
      // Judgment (Bellamy)
      { id: 1251857 },
      // Execution Sentence (target)
      { id: 1248994 },
    ],
  },
});
