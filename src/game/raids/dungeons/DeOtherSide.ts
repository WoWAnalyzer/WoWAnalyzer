import { Dungeon } from 'game/raids';

import Background from './backgrounds/DeOtherSide.jpg';
import Headshot from './headshots/DeOtherSide.jpg';

const DeOtherSide: Dungeon = {
  id: 12291,
  name: 'De Other Side',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_theotherside',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
  },
};

export default DeOtherSide;
