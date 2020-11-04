import { Boss } from "raids/index";

import Background from './images/backgrounds/CastleNathria.jpg';
import Headshot from './images/headshots/CastleNathriaHeadshot.png';

const SunKingsSalvation: Boss = {
  id: 2402,
  name: 'Sun King\'s Salvation',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_kaelthassunstrider',
  fight: {
    vantusRuneBuffId: 311448,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};

export default SunKingsSalvation;