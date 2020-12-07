import { Boss } from "raids/index";

import Background from './images/backgrounds/Sludgefist.jpg';
import Headshot from './images/headshots/Sludgefist.jpg';

const Sludgefist: Boss = {
  id: 2399,
  name: 'Sludgefist',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_sludgefist',
  fight: {
    vantusRuneBuffId: 311451,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};

export default Sludgefist;