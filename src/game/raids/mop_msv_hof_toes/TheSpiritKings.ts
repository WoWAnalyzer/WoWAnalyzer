import type { Boss } from 'game/raids';

import Headshot from './images/TheSpiritKingsHeadshot.jpg';
import Background from './images/TheSpiritKings.jpg';

const TheSpiritKings: Boss = {
  id: 1436,
  name: 'The Spirit Kings',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_moguraid_04',
  fight: {
    timeline: {
      abilities: [
        {
          id: 117708, // Maddening Shout
          type: 'cast',
        },
        {
          id: 117697, // Shield of Darkness
          type: 'cast',
        },
        {
          id: 117910, // Flanking Orders
          type: 'cast',
        },
        {
          id: 118049, // Pillage
          type: 'cast',
        },
        {
          id: 118163, // Robbed Blind
          type: 'cast',
        },
      ],
      debuffs: [
        {
          id: 118048, // Pillaged
        },
        {
          id: 118163, // Robbed Blind
        },
        {
          id: 118135, // Pinned Down
        },
      ],
    },
  },
};

export default TheSpiritKings;
