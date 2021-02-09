import { Dungeon } from 'game/raids';

import Background from './backgrounds/TheaterOfPain.jpg';
import Headshot from './headshots/TheaterOfPain.jpg';


const TheaterOfPain: Dungeon = {
  id: 12293,
  name: 'Theater of Pain',
  background: Background,
  backgroundPosition: 'center bottom',
  headshot: Headshot,
  icon: 'achievement_dungeon_theatreofpain',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
  },
};

export default TheaterOfPain;