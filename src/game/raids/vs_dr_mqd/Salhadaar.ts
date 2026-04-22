import { buildBoss } from 'game/raids/builders';

export const Salhadaar = buildBoss({
  id: 3179,
  name: 'Fallen King Salhadaar',
  timeline: {
    abilities: [
      // Void Convergence (activate orbs)
      { id: 1243453, type: 'cast' },
      // summon kick adds
      { id: 1254081, type: 'cast' },
      // tank spikes
      { id: 1253032, type: 'cast' },
      // spinny
      { id: 1246175, type: 'cast' },
    ],
    debuffs: [
      // puddle drops
      { id: 1248697 },
    ],
  },
});
