import { Boss } from "raids/index";

import Background from './images/backgrounds/CastleNathria.jpg';
import Headshot from './images/headshots/CastleNathriaHeadshot.png';

const LadyInervaDarkvein: Boss = {
  id: 2406,
  name: 'Lady Inerva Darkvein',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_ladyinervadarkvein',
  fight: {
    vantusRuneBuffId: 311449,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};

export default LadyInervaDarkvein