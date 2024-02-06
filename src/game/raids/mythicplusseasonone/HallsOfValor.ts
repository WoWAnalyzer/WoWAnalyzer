import type { Boss } from 'game/raids';

import Background from './backgrounds/HallsOfValor.jpg';
import Headshot from './headshots/HallsOfValor.jpg';

const HallsOfValor: Boss = {
  id: 61477,
  name: 'Halls of Valor',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_hallsofvalor',
  fight: {},
};

export default HallsOfValor;
