import type { Boss } from 'game/raids';

import Headshot from './images/SaurfangHeadshot.jpg';
import Background from './images/Saurfang.jpg';

const Saurfang: Boss = {
  id: 848,
  name: 'Deathbringer Saurfang',
  background: Background,
  headshot: Headshot,
  icon: 'spell_deathknight_bladedarmor',
  fight: {},
};

export default Saurfang;
