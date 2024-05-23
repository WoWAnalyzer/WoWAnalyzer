import type { Boss } from 'game/raids';

import Headshot from './images/ChimaeronHeadshot.jpg';
import Background from './images/Chimaeron.jpg';

const Chimaeron: Boss = {
  id: 1023,
  name: 'Chimaeron',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_blackwingdescent_raid_chimaron', // the typo is in the actual icon name
  fight: {},
};

export default Chimaeron;
