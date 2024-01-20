import type { Boss } from 'game/raids';

import Background from './backgrounds/NeltharionsLair.jpg';
import Headshot from './headshots/NeltharionsLair.jpg';

const NeltharionsLair: Boss = {
  id: 61458,
  name: "Neltharion's Lair",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_neltharionslair',
  fight: {},
};

export default NeltharionsLair;
