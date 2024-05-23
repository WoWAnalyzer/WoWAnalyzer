import type { Boss } from 'game/raids';

import Headshot from './images/NefarianHeadshot.jpg';
import Background from './images/Nefarian.jpg';

const Nefarian: Boss = {
  id: 1026,
  name: "Nefarian's End",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_blackwingdescent_raid_nefarian',
  fight: {},
};

export default Nefarian;
