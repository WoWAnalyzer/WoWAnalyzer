import type { Boss } from 'game/raids';

import Background from './backgrounds/TempleOfTheJadeSerpent.jpg';
import Headshot from './headshots/TempleOfTheJadeSerpent.jpg';

const TempleOfTheJadeSerpent: Boss = {
  id: 10960,
  name: 'Temple of the Jade Serpent',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_jadeserpent',
  fight: {},
};

export default TempleOfTheJadeSerpent;
