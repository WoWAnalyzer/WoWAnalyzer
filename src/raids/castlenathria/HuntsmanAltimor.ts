import { Boss } from "raids/index";

import Background from './images/backgrounds/CastleNathria.jpg';
import Headshot from './images/headshots/CastleNathriaHeadshot.png';

const HuntsmanAltimor: Boss = {
  id: 2418,
  name: 'Huntsman Altimor',
  background: Background,
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