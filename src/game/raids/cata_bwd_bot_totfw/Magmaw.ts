import type { Boss } from 'game/raids';

import Headshot from './images/MagmawHeadshot.jpg';
import Background from './images/Magmaw.jpg';

const Magmaw: Boss = {
  id: 1024,
  name: 'Magmaw',
  background: Background,
  headshot: Headshot,
  icon: 'ability_hunter_pet_worm',
  fight: {},
};

export default Magmaw;
