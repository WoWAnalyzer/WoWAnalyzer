import type { Boss } from 'game/raids';

import Headshot from './images/MorchokHeadshot.jpg';
import Background from './images/Morchok.jpg';

const Morchok: Boss = {
  id: 1292,
  name: 'Morchok',
  background: Background,
  headshot: Headshot,
  icon: 'achievment_boss_morchok.jpg',
  fight: {
    timeline: {
      abilities: [
        {
          // Summon Resonating Crystal -- there is no cast event for this.
          id: 103639,
          type: 'summon',
        },
      ],
    },
  },
};

export default Morchok;
