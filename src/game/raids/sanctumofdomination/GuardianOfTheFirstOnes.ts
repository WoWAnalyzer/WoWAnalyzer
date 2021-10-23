import { Boss } from 'game/raids';

import Background from './images/backgrounds/GuardianOfTheFirstOnes.jpg';
import Headshot from './images/headshots/GuardianOfTheFirstOnes.jpg';

const GuardianOfTheFirstOnes: Boss = {
  id: 2436,
  name: 'Guardian of the First Ones',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_torghast_guardianofthefirstones',
  fight: {
    vantusRuneBuffId: 354390,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};

export default GuardianOfTheFirstOnes;
