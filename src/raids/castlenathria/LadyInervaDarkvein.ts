import { Boss } from "raids/index";

import Background from './images/backgrounds/LadyInervaDarkvein.jpg';
import Headshot from './images/headshots/LadyInervaDarkvein.jpg';

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