import { Boss } from "raids/index";

import Background from './images/backgrounds/SunKingsSalvation.jpg';
import Headshot from './images/headshots/SunKingsSalvation.jpg';

const SunKingsSalvation: Boss = {
  id: 2402,
  name: 'Sun King\'s Salvation',
  background: Background,
  backgroundPosition: 'center top',
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