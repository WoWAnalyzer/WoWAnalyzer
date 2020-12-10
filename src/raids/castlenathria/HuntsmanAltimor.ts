import { Boss } from "raids/index";

import Background from './images/backgrounds/HuntsmanAltimor.jpg';
import Headshot from './images/headshots/HuntsmanAltimor.jpg';

const HuntsmanAltimor: Boss = {
  id: 2418,
  name: 'Huntsman Altimor',
  background: Background,
  backgroundPosition: 'center top',
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_altimor',
  fight: {
    vantusRuneBuffId: 334132,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};

export default HuntsmanAltimor