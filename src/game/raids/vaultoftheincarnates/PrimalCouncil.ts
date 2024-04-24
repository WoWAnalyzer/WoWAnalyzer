import type { Boss } from 'game/raids';

import Background from './backgrounds/primalcouncil.jpg';
import Headshot from './headshots/PrimalCouncil.jpg';

const PrimalCouncil: Boss = {
  id: 2590,
  name: 'The Primal Council',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raidprimalist_council',
  fight: {},
};

export default PrimalCouncil;
