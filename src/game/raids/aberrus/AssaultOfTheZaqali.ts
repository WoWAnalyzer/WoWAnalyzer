import type { Boss } from 'game/raids';

import Background from './backgrounds/AssaultOfTheZaqali.jpg';
import Headshot from './headshots/AssaultOfTheZaqali.jpg';

const AssaultOfTheZaqali: Boss = {
  id: 2682,
  name: 'Assault of the Zaqali',
  background: Background,
  headshot: Headshot,
  icon: 'inv_achievement_raiddragon_zaqaliassault',
  fight: {},
};

export default AssaultOfTheZaqali;
