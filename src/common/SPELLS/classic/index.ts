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

import Spell, { Enchant } from '../Spell';
// Classes
import DEATH_KNIGHT from './deathknight';
import DRUID from './druid';
import HUNTER from './hunter';
import MAGE from './mage';
import ROGUE from './rogue';
import PALADIN from './paladin';
import PRIEST from './priest';
import SHAMAN from './shaman';
import WARLOCK from './warlock';
import WARRIOR from './warrior';
// Other
import Engineering from './engineering';
import Racials from './racials';
import Raids from './raids';
import Tailoring from './tailoring';
import Food from './food';
import Alchemy from './alchemy';

const ABILITIES = {
  ...DEATH_KNIGHT,
  ...DRUID,
  ...HUNTER,
  ...MAGE,
  ...ROGUE,
  ...PALADIN,
  ...PRIEST,
  ...SHAMAN,
  ...WARLOCK,
  ...WARRIOR,
  ...Engineering,
  ...Racials,
  ...Raids,
  ...Tailoring,
  ...Food,
  ...Alchemy,
} as const;

const InternalSpellTable = indexById<Spell | Enchant, typeof ABILITIES>(ABILITIES);
const CLASSIC_SPELLS = proxyRestrictedTable(InternalSpellTable, 'CLASSIC_SPELLS', 'maybeGetSpell');

export default CLASSIC_SPELLS;

export const maybeGetSpell = (key: string | number | undefined): Spell | undefined =>
  key ? InternalSpellTable[key as any] : undefined;

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
