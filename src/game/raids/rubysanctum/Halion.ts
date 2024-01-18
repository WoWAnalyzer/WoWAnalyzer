import type { Boss } from 'game/raids';

import Headshot from './images/HalionHeadshot.jpg';
import Background from './images/Halion.jpg';

const Halion: Boss = {
  id: 887,
  name: 'Halion',
  background: Background,
  headshot: Headshot,
  icon: 'spell_shadow_twilight',
  fight: {},
};

export default Halion;
