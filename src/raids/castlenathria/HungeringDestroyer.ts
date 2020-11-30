import { Boss } from "raids/index";

import Background from './images/backgrounds/CastleNathria.jpg';
import Headshot from './images/headshots/CastleNathriaHeadshot.png';

const HungeringDestroyer: Boss = {
  id: 2383,
  name: 'Hungering Destroyer',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_hungeringdestroyer',
  fight: {
    vantusRuneBuffId: 311446,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};

export default HungeringDestroyer;