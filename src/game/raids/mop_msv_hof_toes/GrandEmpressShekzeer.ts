import type { Boss } from 'game/raids';

import Headshot from './images/GrandEmpressShekzeerHeadshot.jpg';
// import Background from './images/GrandEmpressShekzeer.jpg';
import Background from './images/PlaceHolder.jpg';

const GrandEmpressShekzeer: Boss = {
  id: 1501,
  name: "Grand Empress Shek'zeer",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_mantidraid07',
  fight: {},
};

export default GrandEmpressShekzeer;
