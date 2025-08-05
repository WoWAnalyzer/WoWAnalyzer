import type { Boss } from 'game/raids';

import Headshot from './images/FengTheAccursedHeadshot.jpg';
import Background from './images/FengTheAccursed.jpg';

const FengTheAccursed: Boss = {
  id: 1390,
  name: 'Feng the Accursed',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_moguraid_02',
  fight: {
    timeline: {
      debuffs: [
        {
          id: 116417, // Arcane Resonance (spread debuff)
        },
        {
          id: 116784, // Wildfire Spark (puddle debuff)
        },
        {
          id: 116374, // Lightning Charge (stun debuff)
        },
      ],
      abilities: [
        {
          id: 1244534, // Spirit of the Staff
          type: 'cast',
        },
        {
          id: 1244535, // Spirit of the Spear
          type: 'cast',
        },
        {
          id: 1244533, // Spirit of the Fist
          type: 'cast',
        },
        {
          id: 1244528, // Spirit of the Shield
          type: 'cast',
        },
        {
          id: 116364, // Arcane Velocity (run in)
          type: 'cast',
        },
        {
          id: 116018, // Epicenter (run away)
          type: 'begincast',
        },
      ],
    },
  },
};

export default FengTheAccursed;
