import { spellIndexableList } from '../../Spell';
import DEATH_KNIGHT from './deathknight';
import DRUID from './druid';
import MAGE from './mage';
import MONK from './monk';
import PALADIN from './paladin';
import PRIEST from './priest';
import ROGUE from './rogue';
import SHAMAN from './shaman';
import WARLOCK from './warlock';
import WARRIOR from './warrior';

const legendaries = spellIndexableList({
  ...DEATH_KNIGHT,
  ...DRUID,
  ...MAGE,
  ...MONK,
  ...PALADIN,
  ...PRIEST,
  ...ROGUE,
  ...SHAMAN,
  ...WARLOCK,
  ...WARRIOR,
});

export default legendaries;
