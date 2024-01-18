import type { Boss } from 'game/raids';

import Background from './backgrounds/Uldaman.jpg';
import Headshot from './headshots/Uldaman.jpg';

const Uldaman: Boss = {
  id: 12451,
  name: 'Uldaman: Legacy of Tyr',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_uldaman',
  fight: {},
};

export default Uldaman;
