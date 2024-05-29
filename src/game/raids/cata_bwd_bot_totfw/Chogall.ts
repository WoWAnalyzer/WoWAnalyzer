import type { Boss } from 'game/raids';

import Headshot from './images/ChogallHeadshot.jpg';
import Background from './images/Chogall.jpg';

const Chogall: Boss = {
  id: 1029,
  name: "Cho'gall",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_bastion-of-twilight_chogall-boss',
  fight: {},
};

export default Chogall;
