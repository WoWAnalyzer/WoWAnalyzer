import type { Boss } from 'game/raids';

import Headshot from './images/DeathwingMadnessHeadshot.jpg';
// import Background from './images/DeathwingMadness.jpg';
import Background from './images/DeathwingWallpaper.jpg';

const DeathwingMadness: Boss = {
  id: 1299,
  name: 'Madness of Deathwing',
  background: Background,
  headshot: Headshot,
  icon: 'achievment_boss_madnessofdeathwing.jpg',
  fight: {},
};

export default DeathwingMadness;
