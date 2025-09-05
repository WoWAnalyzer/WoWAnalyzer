import type { Boss } from 'game/raids';

import Headshot from './images/WindLordMeljarakHeadshot.jpg';
import Background from './images/WindLordMeljarak.jpg';

const WindLordMeljarak: Boss = {
  id: 1498,
  name: "Wind Lord Mel'jarak",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_mantidraid04',
  fight: {
    timeline: {
      abilities: [
        {
          id: 121876, // Amber Prison
          type: 'cast',
        },
        {
          id: 131813, // Wind Bomb
          type: 'cast',
        },
        {
          id: 121896, // Whirling Blade
          type: 'cast',
        },
      ],
      debuffs: [
        {
          id: 122064, // Corrosive Resin
        },
        {
          id: 121885, // Amber Prison (stun)
        },
      ],
    },
  },
};

export default WindLordMeljarak;
