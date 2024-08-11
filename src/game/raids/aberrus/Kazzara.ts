import type { Boss } from 'game/raids';

import Background from './backgrounds/Kazzara.jpg';
import Headshot from './headshots/Kazzara.jpg';

const Kazzara: Boss = {
  id: 2688,
  name: 'Kazzara, the Hellforged',
  background: Background,
  headshot: Headshot,
  icon: 'inv_achievement_raiddragon_kazzara',
  fight: {},
};

export default Kazzara;
