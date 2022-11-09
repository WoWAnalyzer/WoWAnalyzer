import { spellIndexableList } from '../../Spell';
import DEATH_KNIGHT from './deathknight';
import DRUID from './druid';
import GENERAL from './general';
import MAGE from './mage';
import MONK from './monk';
import PALADIN from './paladin';
import PRIEST from './priest';
import ROGUE from './rogue';
import SHAMAN from './shaman';
import SHARED from './shared';
import WARLOCK from './warlock';
import WARRIOR from './warrior';

const covenants = spellIndexableList({
  ...DEATH_KNIGHT,
  ...DRUID,
  ...GENERAL,
  ...MAGE,
  ...MONK,
  ...PALADIN,
  ...PRIEST,
  ...ROGUE,
  ...SHAMAN,
  ...WARLOCK,
  ...WARRIOR,
  ...SHARED,
});

export default covenants;
