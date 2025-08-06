import type { Boss } from 'game/raids';

import Headshot from './images/GaralonHeadshot.jpg';
// import Background from './images/Garalon.jpg';
import Background from './images/PlaceHolder.jpg';

const Garalon: Boss = {
  id: 1463,
  name: 'Garalon',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_mantidraid05',
  fight: {},
};

export default Garalon;
