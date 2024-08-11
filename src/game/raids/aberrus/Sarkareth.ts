import type { Boss } from 'game/raids';

import Background from './backgrounds/Sarkareth.jpg';
import Headshot from './headshots/Sarkareth.jpg';

const Sarkareth: Boss = {
  id: 2685,
  name: 'Scalecommander Sarkareth',
  background: Background,
  headshot: Headshot,
  icon: 'inv_achievement_raiddragon_sarkareth',
  fight: {},
};

export default Sarkareth;
