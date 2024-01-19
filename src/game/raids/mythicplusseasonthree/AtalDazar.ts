import type { Boss } from 'game/raids';

import Background from './backgrounds/AtalDazar.jpg';
import Headshot from './headshots/AtalDazar.jpg';

const AtalDazar: Boss = {
  id: 61763,
  name: "Atal'Dazar",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_ataldazar',
  fight: {},
};

export default AtalDazar;
