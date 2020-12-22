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

import indexById from 'common/indexById';

import OTHERS from './others';
import RACIALS from './racials';
import SHADOWLANDS from './shadowlands';
import ENCOUNTER from './encounter';

import TALENTS_DEATH_KNIGHT from './talents/deathknight';
import TALENTS_DEMON_HUNTER from './talents/demonhunter';
import TALENTS_DRUID from './talents/druid';
import TALENTS_HUNTER from './talents/hunter';
import TALENTS_MAGE from './talents/mage';
import TALENTS_MONK from './talents/monk';
import TALENTS_PALADIN from './talents/paladin';
import TALENTS_PRIEST from './talents/priest';
import TALENTS_ROGUE from './talents/rogue';
import TALENTS_SHAMAN from './talents/shaman';
import TALENTS_WARLOCK from './talents/warlock';
import TALENTS_WARRIOR from './talents/warrior';

import DEATH_KNIGHT from './deathknight';
import DEMON_HUNTER from './demonhunter';
import DRUID from './druid';
import HUNTER from './hunter';
import MAGE from './mage';
import MONK from './monk';
import PALADIN from './paladin';
import PRIEST from './priest';
import ROGUE from './rogue';
import SHAMAN from './shaman';
import WARLOCK from './warlock';
import WARRIOR from './warrior';
import Spell, { LegendarySpell } from './Spell';

export const ABILITIES = {
  // Talents are auto generated
  ...TALENTS_DEATH_KNIGHT,
  ...TALENTS_DEMON_HUNTER,
  ...TALENTS_DRUID,
  ...TALENTS_HUNTER,
  ...TALENTS_MAGE,
  ...TALENTS_MONK,
  ...TALENTS_PALADIN,
  ...TALENTS_PRIEST,
  ...TALENTS_ROGUE,
  ...TALENTS_SHAMAN,
  ...TALENTS_WARLOCK,
  ...TALENTS_WARRIOR,
  // Talents can be overwritten with custom spell objects
  ...OTHERS,
  ...ENCOUNTER,
  ...RACIALS,
  ...DEATH_KNIGHT,
  ...DEMON_HUNTER,
  ...DRUID,
  ...HUNTER,
  ...MAGE,
  ...MONK,
  ...PALADIN,
  ...PRIEST,
  ...ROGUE,
  ...SHAMAN,
  ...WARLOCK,
  ...WARRIOR,
  ...SHADOWLANDS,
} as const;

const ids = indexById(ABILITIES);

const MergeSpells: typeof ABILITIES & Record<number, Spell | LegendarySpell> = {
  ...ids,
  ...ABILITIES,
};

export default MergeSpells;
// If you remove this indexById you can see what spells are undefined.
// But you'll get a lot of other errors.
// We should type indexById properly some day to make this standard.
// And then fix all those errors.
// Which will prevent bugs.
// export default ALL_SPELLS;
