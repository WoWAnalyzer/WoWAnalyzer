import type { Boss } from 'game/raids';

import Headshot from './images/MajordomoStaghelmHeadshot.jpg';
// import Background from './images/MajordomoStaghelm.jpg';
import Background from './images/CataImpossibleOdds.jpg';

const MajordomoStaghelm: Boss = {
  id: 1185,
  name: 'Majordomo Staghelm',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_firelands-raid_fandral-staghelm.jpg',
  fight: {},
};

export default MajordomoStaghelm;
