import background from './backgrounds/CrownOfTheCosmos.jpg';
import { buildBoss } from 'game/raids/builders';

export const CrownOfTheCosmos = buildBoss({
  background,
  id: 3181,
  name: 'Crown of the Cosmos',
  timeline: {
    abilities: [
      // interrupting tremor
      { id: 1243743, type: 'cast' },
      // ravenous abyss (vorelus circle)
      { id: 1243753, type: 'cast' },
      // Void Expulsion (area denial)
      { id: 1233819, type: 'cast' },
      // summon voidspawn
      { id: 1237837, type: 'cast' },
      // Aspect of the End
      { id: 1239080, type: 'cast' },
      // Devouring Cosmos
      { id: 1238843, type: 'cast' },
    ],
    debuffs: [
      // silverstrike arrow (p1)
      { id: 1233602 },
      // grasp of emptiness (obelisks)
      { id: 1260027 },
      // Ranger-Captain's Mark
      { id: 1259861 },
      // Aspect of the End (tether)
      { id: 1239111 },
    ],
  },
});
