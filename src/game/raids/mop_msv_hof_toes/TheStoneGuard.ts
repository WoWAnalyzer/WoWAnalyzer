import type { Boss } from 'game/raids';

import Headshot from './images/TheStoneGuardHeadshot.jpg';
// import Background from './images/TheStoneGuard.jpg';
import Background from './images/PlaceHolder.jpg';

const TheStoneGuard: Boss = {
  id: 1395,
  name: 'The Stone Guard',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_moguraid_01',
  fight: {},
};

export default TheStoneGuard;
