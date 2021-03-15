import DEATH_KNIGHT from './deathknight';
import DEMON_HUNTER from './demonhunter';
import DRUID from './druid';
import GENERAL from './general';
import HUNTER from './hunter';
import MAGE from './mage';
import MONK from './monk';
import PALADIN from './paladin';
import PRIEST from './priest';
import ROGUE from './rogue';
import SHAMAN from './shaman';
import SHARED from './shared';
import WARLOCK from './warlock';
import WARRIOR from './warrior';

const covenants = {
  ...DEATH_KNIGHT,
  ...DEMON_HUNTER,
  ...DRUID,
  ...GENERAL,
  ...HUNTER,
  ...MAGE,
  ...MONK,
  ...PALADIN,
  ...PRIEST,
  ...ROGUE,
  ...SHAMAN,
  ...WARLOCK,
  ...WARRIOR,
  ...SHARED,
} as const;

export default covenants;
