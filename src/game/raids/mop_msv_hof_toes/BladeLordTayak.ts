import type { Boss } from 'game/raids';

import Headshot from './images/BladeLordTayakHeadshot.jpg';
// import Background from './images/BladeLordTayak.jpg';
import Background from './images/PlaceHolder.jpg';

const BladeLordTayak: Boss = {
  id: 1504,
  name: "Blade Lord Ta'yak",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_mantidraid03',
  fight: {},
};

export default BladeLordTayak;
