/** ****************************************************************************************************************
 * This file should not be changed; it only merges all the different spell files into one access point to make it
 * all easier to use.
 *
 * Instead, to add a spell go to the relevant class file and do so there (yes you need to do it manually). If it's
 * a racial, go to SPELLS_RACIALS, and if it's neither it goes in SPELLS_OTHERS. Do NOT change the talents files
 * as they're auto generated. If your spells use a power not currently available in the talents, you can update
 * and re-run the talent auto-generator in ../DevTools/generateTalents.js to add them to your talents.
 *
 * NOTE: the indexById functions copies all manually added spells under their spell id. So if you defined
 * `MY_SPELL: { id: 1337,  }`, it will become available under SPELLS.MY_SPELL as well as SPELLS[1337]. You should
 * use the named spell by default, this makes things much more readable.
 **************************************************************************************************************** */

import indexById, { proxyRestrictedTable } from 'common/indexById';
import { CLASSIC_EXPANSION, RETAIL_EXPANSION } from 'game/Expansion';
import { maybeGetSpell as maybeGetClassicSpell } from 'common/SPELLS/classic';
import safeMerge from 'common/safeMerge';

import DEATH_KNIGHT from './deathknight';
import DEMON_HUNTER from './demonhunter';
import DRUID from './druid';
import ENCOUNTER from './encounter';
import EVOKER from './evoker';
import HUNTER from './hunter';
import MAGE from 'analysis/retail/mage/shared/SPELLS';
import ARCANE_MAGE from 'analysis/retail/mage/arcane/SPELLS';
import FIRE_MAGE from 'analysis/retail/mage/fire/SPELLS';
import FROST_MAGE from 'analysis/retail/mage/frost/SPELLS';
import MONK from './monk';
import OTHERS from './others';
import PALADIN from './paladin';
import PRIEST from './priest';
import RACIALS from './racials';
import ROGUE from './rogue';
import DRAGONFLIGHT from './dragonflight';
import THEWARWITHIN from './thewarwithin';
import SHAMAN from './shaman';
import Spell, { Enchant } from './Spell';
import WARLOCK from './warlock';
import WARRIOR from './warrior';

const ABILITIES = safeMerge(
  OTHERS,
  ENCOUNTER,
  RACIALS,
  DEATH_KNIGHT,
  DEMON_HUNTER,
  DRUID,
  EVOKER,
  HUNTER,
  MAGE,
  ARCANE_MAGE,
  FIRE_MAGE,
  FROST_MAGE,
  MONK,
  PALADIN,
  PRIEST,
  ROGUE,
  SHAMAN,
  WARLOCK,
  WARRIOR,
  DRAGONFLIGHT,
  THEWARWITHIN,
);

const InternalSpellTable = indexById<Spell | Enchant, typeof ABILITIES>(ABILITIES);
const SPELLS = proxyRestrictedTable(InternalSpellTable, 'SPELLS', 'maybeGetSpell');

export default SPELLS;

export function maybeGetSpell(
  key: string | number | undefined,
  expansion = RETAIL_EXPANSION,
): Spell | undefined {
  if (expansion === CLASSIC_EXPANSION) {
    return maybeGetClassicSpell(key);
  }
  return key ? InternalSpellTable[key as any] : undefined;
}

export const registerSpell = (id: number, name: string, icon: string) => {
  if (InternalSpellTable[id]) {
    return;
  }

  InternalSpellTable[id] = {
    id,
    name,
    icon,
  };
};
