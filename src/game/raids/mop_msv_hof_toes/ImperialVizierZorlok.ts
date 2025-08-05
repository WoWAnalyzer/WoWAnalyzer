import type { Boss } from 'game/raids';

import Headshot from './images/ImperialVizierZorlokHeadshot.jpg';
// import Background from './images/ImperialVizierZorlok.jpg';
import Background from './images/PlaceHolder.jpg';

const ImperialVizierZorlok: Boss = {
  id: 1507,
  name: "Imperial Vizier Zor'lok",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_mantidraid02',
  fight: {},
};

export default ImperialVizierZorlok;
