import type { Boss } from 'game/raids';

import Background from './backgrounds/sennarth.jpg';
import Headshot from './headshots/Sennarth.jpg';

const Sennarth: Boss = {
  id: 2592,
  name: 'Sennarth, the Cold Breath',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raidprimalist_sennarth',
  fight: {},
};

export default Sennarth;
