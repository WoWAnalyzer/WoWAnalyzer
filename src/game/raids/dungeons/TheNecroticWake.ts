import Background from './backgrounds/TheNecroticWake.jpg';
import Headshot from './headshots/TheNecroticWake.jpg';
import { Dungeon } from 'game/raids';

const TheNecroticWake: Dungeon = {
  id: 12286,
  name: 'The Necrotic Wake',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_thenecroticwake',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
  },
};

export default TheNecroticWake;