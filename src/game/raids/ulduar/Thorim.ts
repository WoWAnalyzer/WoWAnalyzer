import type { Boss } from 'game/raids';

import Headshot from './images/ThorimHeadshot.jpg';
import Background from './images/Thorim.jpg';

const Thorim: Boss = {
  id: 752,
  name: 'Thorim',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_thorim',
  fight: {},
};

export default Thorim;
