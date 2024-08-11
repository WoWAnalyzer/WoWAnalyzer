import type { Boss } from 'game/raids';

import Background from './backgrounds/AmalgamationChamber.jpg';
import Headshot from './headshots/AmalgamationChamber.jpg';

const AmalgamationChamber: Boss = {
  id: 2687,
  name: 'The Amalgamation Chamber',
  background: Background,
  headshot: Headshot,
  icon: 'inv_achievement_raiddragon_amalgamationchamber',
  fight: {},
};

export default AmalgamationChamber;
