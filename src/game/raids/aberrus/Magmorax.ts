import type { Boss } from 'game/raids';

import Background from './backgrounds/Magmorax.jpg';
import Headshot from './headshots/Magmorax.jpg';

const Magmorax: Boss = {
  id: 2683,
  name: 'Magmorax',
  background: Background,
  headshot: Headshot,
  icon: 'inv_achievement_raiddragon_magmorax',
  fight: {},
};

export default Magmorax;
