import { Boss } from "raids/index";

import Background from './images/backgrounds/CastleNathria.jpg';
import Headshot from './images/headshots/CastleNathriaHeadshot.png';

const ArtificerXymox: Boss = {
  id: 2405,
  name: 'Artificer Xy\'mox',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_artificerxymox',
  fight: {
    vantusRuneBuffId: 311447,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};

export default ArtificerXymox;