import background from './backgrounds/Vorasius.jpg';
import { buildBoss } from 'game/raids/builders';

export const Vorasius = buildBoss({
  background,
  id: 3177,
  name: 'Vorasius',
  timeline: {
    abilities: [
      // Primordial Roar
      { id: 1260052, type: 'cast' },
      // Parasite Expulsion
      { id: 1254199, type: 'cast' },
      // Void Breath
      { id: 1256855, type: 'cast' },
    ],
    debuffs: [
      // Fixate
      { id: 1254113, type: 'debuff' },
    ],
  },
});
