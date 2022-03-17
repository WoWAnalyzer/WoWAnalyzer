import { Boss } from 'game/raids';

import Background from './images/Anduin.jpg';

const Anduin: Boss = {
  id: 2546,
  name: 'Anduin Wrynn',
  background: Background,
  icon: 'inv_achievement_raid_progenitorraid_anduin',
  fight: {
    vantusRuneBuffId: 367134,
  },
};

export default Anduin;
