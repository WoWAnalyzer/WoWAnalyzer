import type { Boss } from 'game/raids';

import Headshot from './images/FestergutHeadshot.jpg';
import Background from './images/Festergut.jpg';

const Festergut: Boss = {
  id: 849,
  name: 'Festergut',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_festergutrotface',
  fight: {},
};

export default Festergut;
