import type { Boss } from 'game/raids';

import Headshot from './images/BalerocHeadshot.jpg';
// import Background from './images/Baleroc.jpg';
import Background from './images/CataImpossibleOdds.jpg';

const Baleroc: Boss = {
  id: 1200,
  name: 'Baleroc',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_firelandsraid_balorocthegatekeeper.jpg',
  fight: {},
};

export default Baleroc;
