import type { Boss } from 'game/raids';

import Headshot from './images/ShaOfFearHeadshot.jpg';
// import Background from './images/ShaOfFear.jpg';
import Background from './images/PlaceHolder.jpg';

const ShaOfFear: Boss = {
  id: 1431,
  name: 'Sha of Fear',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_terraceofendlessspring04',
  fight: {
    resultsWarning:
      'The side platforms in Phase 1 have range issues, which can cause ANALYSIS ERRORS. Phase 2 does not have this problem.',
  },
};

export default ShaOfFear;
