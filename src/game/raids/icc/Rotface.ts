import type { Boss } from 'game/raids';

import Headshot from './images/RotfaceHeadshot.jpg';
import Background from './images/Rotface.jpg';

const Rotface: Boss = {
  id: 850,
  name: 'Rotface',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_festergutrotface',
  fight: {},
};

export default Rotface;
