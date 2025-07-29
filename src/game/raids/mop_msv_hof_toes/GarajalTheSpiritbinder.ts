import type { Boss } from 'game/raids';

import Headshot from './images/GarajalTheSpiritbinderHeadshot.jpg';
import Background from './images/GarajalTheSpiritbinder.jpg';

const GarajalTheSpiritbinder: Boss = {
  id: 1434,
  name: "Gara'jal the Spiritbinder",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_moguraid_03',
  fight: {
    timeline: {
      debuffs: [
        {
          id: 116161, // Crossed Over
        },
      ],
      abilities: [
        {
          id: 116174, // Summon Spirit Totem
          type: 'cast',
        },
        {
          id: 116272, // Banishment
          type: 'cast',
        },
      ],
    },
  },
};

export default GarajalTheSpiritbinder;
