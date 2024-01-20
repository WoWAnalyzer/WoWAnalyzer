import type { Boss } from 'game/raids';

import Background from './images/raszageth.jpg';

const Raszageth: Boss = {
  id: 2607,
  name: 'Raszageth the Storm-Eater',
  background: Background,
  icon: 'achievement_raidprimalist_raszageth',
  fight: {
    resultsWarning:
      "During the first intermission, the two teams are briefly out of logging range of each other. This can cause errors in analysis. You can work around this by using a log uploaded by a person that is on the same side platform as the player you're analyzing.",
  },
};

export default Raszageth;
