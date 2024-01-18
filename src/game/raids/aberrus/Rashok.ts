import type { Boss } from 'game/raids';

import Background from './backgrounds/Rashok.jpg';
import Headshot from './headshots/Rashok.jpg';

const Rashok: Boss = {
  id: 2680,
  name: 'Rashok, the Elder',
  background: Background,
  headshot: Headshot,
  icon: 'inv_achievement_raiddragon_rashok',
  fight: {},
};

export default Rashok;
