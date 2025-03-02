import type { Boss } from 'game/raids';

import Headshot from './images/BethtilacHeadshot.jpg';
// import Background from './images/Bethtilac.jpg';
import Background from './images/CataImpossibleOdds.jpg';

const Bethtilac: Boss = {
  id: 1197,
  name: "Beth'tilac",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_broodmotheraranae.jpg',
  fight: {
    timeline: {
      abilities: [
        {
          // Smoldering Devastation
          id: 99052,
          type: 'cast',
        },
      ],
      debuffs: [
        {
          // Fixate
          id: 99526,
        },
        {
          // Widow's Kiss
          id: 99506,
        },
      ],
    },
  },
};

export default Bethtilac;
