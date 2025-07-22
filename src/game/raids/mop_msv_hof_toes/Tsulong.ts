import type { Boss } from 'game/raids';

import Headshot from './images/TsulongHeadshot.jpg';
// import Background from './images/Tsulong.jpg';
import Background from './images/PlaceHolder.jpg';

const Tsulong: Boss = {
  id: 1505,
  name: 'Tsulong',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_terraceofendlessspring02',
  fight: {},
};

export default Tsulong;
