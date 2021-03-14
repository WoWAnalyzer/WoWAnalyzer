import { Dungeon } from 'game/raids';

import Background from './backgrounds/SanguineDepths.jpg';
import Headshot from './headshots/SanguineDepths.jpg';

const SanguineDepths: Dungeon = {
  id: 12284,
  name: 'Sanguine Depths',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_sanguinedepths',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
  },
};

export default SanguineDepths;
