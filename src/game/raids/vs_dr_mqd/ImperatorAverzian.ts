import background from './backgrounds/ImperatorAverzian.jpg';
import { buildBoss } from 'game/raids/builders';

export const ImperatorAverzian = buildBoss({
  background,
  id: 3176,
  name: 'Imperator Averzian',
  timeline: {
    abilities: [
      // Shadow's Advance (Summon Tic-Tac-Toe adds) - 2 versions
      { id: 1251361, type: 'cast' },
      { id: 1262776, type: 'cast' },
      // Umbral Collapse (group soak) - 2 versions
      { id: 1249266, type: 'cast' },
      { id: 1260206, type: 'cast' },
      // Void Fall (non-enrage march) - 2 versions
      { id: 1258880, type: 'cast' },
      { id: 1266786, type: 'cast' },
      // March of the Endless (enrage)
      { id: 1251583, type: 'cast' },
    ],
    debuffs: [
      // Void Marked (mythic dispel)
      { id: 1280013, type: 'debuff' },
      // Umbral Collapse (tank marked with group soak)
      { id: 1260203, type: 'debuff' },
      { id: 1249265, type: 'debuff' },
    ],
  },
});
