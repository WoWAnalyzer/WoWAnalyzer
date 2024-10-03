import type { Boss } from 'game/raids';

import Headshot from './images/RagnarosHeadshot.jpg';
// import Background from './images/Ragnaros.jpg';
import Background from './images/CataImpossibleOdds.jpg';

const Ragnaros: Boss = {
  id: 1203,
  name: 'Ragnaros',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_firelands-raid_ragnaros.jpg',
  fight: {},
};

export default Ragnaros;
