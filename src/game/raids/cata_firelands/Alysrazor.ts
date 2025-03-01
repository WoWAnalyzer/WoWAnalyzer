import type { Boss } from 'game/raids';

import Headshot from './images/AlysrazorHeadshot.jpg';
// import Background from './images/Alysrazor.jpg';
import Background from './images/CataImpossibleOdds.jpg';

const Alysrazor: Boss = {
  id: 1206,
  name: 'Alysrazor',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_firelands-raid_alysra.jpg',
  fight: {
    timeline: {
      abilities: [
        {
          // Molting
          id: 99464,
          type: 'cast',
        },
        {
          // Molting
          id: 100836,
          type: 'cast',
        },
        {
          // Cataclysm
          id: 100761,
          type: 'cast',
        },
        {
          // Cataclysm
          id: 102111,
          type: 'cast',
        },
        {
          // Blazing Claw (Normal)
          id: 99844,
          type: 'cast',
        },
        {
          // Firestorm (Heroic)
          id: 100744,
          type: 'cast',
        },
      ],
      debuffs: [
        {
          // Imprinted
          id: 100359,
        },
        {
          // Imprinted
          id: 99389,
        },
        {
          // Molten Feather
          id: 97128,
          type: 'buff',
        },
      ],
    },
  },
};

export default Alysrazor;
