import type { Boss } from 'game/raids';

import Headshot from './images/WillOfTheEmperorHeadshot.jpg';
import Background from './images/WillOfTheEmperor.jpg';

const WillOfTheEmperor: Boss = {
  id: 1407,
  name: 'Will of the Emperor',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_moguraid_06',
  fight: {
    timeline: {
      abilities: [
        {
          id: 1245126, // Emperor's Rage
          type: 'cast',
        },
        {
          id: 1245131, // Emperor's Strength
          type: 'cast',
        },
      ],
      debuffs: [],
    },
  },
};

export default WillOfTheEmperor;
