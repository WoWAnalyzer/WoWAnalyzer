import Background from './backgrounds/SpiresOfAscension.jpg';
import Headshot from './headshots/SpiresOfAscension.jpg';
import { Dungeon } from 'game/raids';

const SpiresOfAscension: Dungeon = {
  id: 12285,
  name: 'Spires of Ascension',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_spiresofascension',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
  },
};

export default SpiresOfAscension;