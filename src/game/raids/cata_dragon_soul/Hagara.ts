import type { Boss } from 'game/raids';

import Headshot from './images/HagaraHeadshot.jpg';
// import Background from './images/Hagara.jpg';
import Background from './images/DeathwingWallpaper.jpg';

const Hagara: Boss = {
  id: 1296,
  name: 'Hagara the Stormbinder',
  background: Background,
  headshot: Headshot,
  icon: 'achievment_boss_hagara.jpg',
  fight: {},
};

export default Hagara;
