import type { Boss } from 'game/raids';

import Headshot from './images/IgnisHeadshot.jpg';
import Background from './images/Ignis.jpg';

const Ignis: Boss = {
  id: 745,
  name: 'Ignis the Furnace Master',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_ignis_01',
  fight: {},
};

export default Ignis;
