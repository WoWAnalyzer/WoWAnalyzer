import { Boss } from "raids/index";

import Background from './images/backgrounds/ArtificerXymox.jpg';
import Headshot from './images/headshots/ArtificerXymox.jpg';

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