import type { Boss } from 'game/raids';

import Background from './backgrounds/DawnOfTheInfinite.png';
import Headshot from './headshots/GalakrondsFall.jpg';

const GalakrondsFall: Boss = {
  id: 12579,
  name: "DOTI: Galakrond's Fall",
  background: Background,
  headshot: Headshot,
  icon: 'ability_evoker_timespiral',
  fight: {},
};

export default GalakrondsFall;
