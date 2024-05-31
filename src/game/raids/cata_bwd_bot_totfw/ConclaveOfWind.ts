import type { Boss } from 'game/raids';

import Headshot from './images/ConclaveOfWindHeadshot.jpg';
import Background from './images/ConclaveOfWind.jpg';

const ConclaveOfWind: Boss = {
  id: 1035,
  name: 'Conclave of Wind',
  background: Background,
  headshot: Headshot,
  icon: 'ability_druid_galewinds',
  fight: {},
};

export default ConclaveOfWind;
