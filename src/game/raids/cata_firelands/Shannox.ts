import type { Boss } from 'game/raids';

import Headshot from './images/ShannoxHeadshot.jpg';
// import Background from './images/Shannox.jpg';
import Background from './images/CataImpossibleOdds.jpg';

const Shannox: Boss = {
  id: 1205,
  name: 'Shannox',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_shannox.jpg',
  fight: {},
};

export default Shannox;
