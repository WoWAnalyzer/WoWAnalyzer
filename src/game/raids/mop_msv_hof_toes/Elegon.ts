import type { Boss } from 'game/raids';

import Headshot from './images/ElegonHeadshot.jpg';
// import Background from './images/Elegon.jpg';
import Background from './images/PlaceHolder.jpg';

const Elegon: Boss = {
  id: 1500,
  name: 'Elegon',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_moguraid_05',
  fight: {},
};

export default Elegon;
