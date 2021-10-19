import { Boss } from 'game/raids';

import Background from './images/backgrounds/SoulrenderDormazain.jpg';
import Headshot from './images/headshots/SoulrenderDormazain.jpg';

const SoulrenderDormazain: Boss = {
  id: 2434,
  name: 'Soulrender Dormazain',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_torghast_soulrenderdormazain',
  fight: {
    vantusRuneBuffId: 354388,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};

export default SoulrenderDormazain;
