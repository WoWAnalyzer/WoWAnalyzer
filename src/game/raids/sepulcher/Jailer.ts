import { Boss } from 'game/raids';

import Background from './images/Jailer.jpg';

const Jailer: Boss = {
  id: 2537,
  name: 'The Jailer, Zovaal',
  background: Background,
  icon: 'inv_achievement_raid_progenitorraid_jailer',
  fight: {
    vantusRuneBuffId: 367143,
  },
};

export default Jailer;
