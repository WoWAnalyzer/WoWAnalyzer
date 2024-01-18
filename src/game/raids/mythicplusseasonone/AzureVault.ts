import type { Boss } from 'game/raids';

import Background from './backgrounds/AzureVault.jpg';
import Headshot from './headshots/AzureVault.jpg';

const AzureVault: Boss = {
  id: 12515,
  name: 'The Azure Vault',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_dungeon_arcanevaults',
  fight: {},
};

export default AzureVault;
