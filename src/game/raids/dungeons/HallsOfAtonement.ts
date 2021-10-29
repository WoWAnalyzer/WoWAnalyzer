import { Dungeon } from 'game/raids';

import Background from './backgrounds/HallsOfAtonement.jpg';
import Headshot from './headshots/HallsOfAtonement.jpg';

const HallsOfAtonement: Dungeon = {
  id: 12287,
  name: 'Halls of Atonement',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_hallsofatonement',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
  },
};

export default HallsOfAtonement;
