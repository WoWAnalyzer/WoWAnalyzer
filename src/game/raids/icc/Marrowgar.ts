import type { Boss } from 'game/raids';

import Headshot from './images/MarrowgarHeadshot.jpg';
import Background from './images/Marrowgar.jpg';

const Marrowgar: Boss = {
  id: 845,
  name: 'Lord Marrowgar',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_lordmarrowgar',
  fight: {},
};

export default Marrowgar;
