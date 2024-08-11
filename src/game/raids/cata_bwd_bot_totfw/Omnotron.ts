import type { Boss } from 'game/raids';

import Headshot from './images/OmnotronHeadshot.jpg';
import Background from './images/Omnotron.jpg';

const Omnotron: Boss = {
  id: 1027,
  name: 'Omnotron Defense System',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_blackwingdescent_darkironcouncil',
  fight: {},
};

export default Omnotron;
