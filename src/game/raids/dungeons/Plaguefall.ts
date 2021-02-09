import Background from './backgrounds/Plaguefall.jpg';
import Headshot from './headshots/Plaguefall.jpg';
import { Dungeon } from 'game/raids';

const Plaguefall: Dungeon = {
  id: 12289,
  name: 'Plaguefall',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_plaguefall',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
  },
};

export default Plaguefall;
