import type { Boss } from 'game/raids';

import Headshot from './images/AlysrazorHeadshot.jpg';
// import Background from './images/Alysrazor.jpg';
import Background from './images/CataImpossibleOdds.jpg';

const Alysrazor: Boss = {
  id: 1206,
  name: 'Alysrazor',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_firelands-raid_alysra.jpg',
  fight: {},
};

export default Alysrazor;
