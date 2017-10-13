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
 * `MY_SPELL: { id: 1337, ... }`, it will become available under SPELLS.MY_SPELL as well as SPELLS[1337]. You should
 * use the named spell by default, this makes things much more readable.
 **************************************************************************************************************** */

import indexById from './indexById';

import SPELLS_OTHERS from './SPELLS_OTHERS';
import SPELLS_RACIALS from './SPELLS_RACIALS';

import TALENTS_DEATH_KNIGHT from './talents/TALENTS_DEATH_KNIGHT';
import TALENTS_DEMON_HUNTER from './talents/TALENTS_DEMON_HUNTER';
import TALENTS_DRUID from './talents/TALENTS_DRUID';
import TALENTS_HUNTER from './talents/TALENTS_HUNTER';
import TALENTS_MAGE from './talents/TALENTS_MAGE';
import TALENTS_MONK from './talents/TALENTS_MONK';
import TALENTS_PALADIN from './talents/TALENTS_PALADIN';
import TALENTS_PRIEST from './talents/TALENTS_PRIEST';
import TALENTS_ROGUE from './talents/TALENTS_ROGUE';
import TALENTS_SHAMAN from './talents/TALENTS_SHAMAN';
import TALENTS_WARLOCK from './talents/TALENTS_WARLOCK';
import TALENTS_WARRIOR from './talents/TALENTS_WARRIOR';

import SPELLS_DEATH_KNIGHT from './SPELLS_DEATH_KNIGHT';
import SPELLS_DEMON_HUNTER from './SPELLS_DEMON_HUNTER';
import SPELLS_DRUID from './SPELLS_DRUID';
import SPELLS_HUNTER from './SPELLS_HUNTER';
import SPELLS_MAGE from './SPELLS_MAGE';
import SPELLS_MONK from './SPELLS_MONK';
import SPELLS_PALADIN from './SPELLS_PALADIN';
import SPELLS_PRIEST from './SPELLS_PRIEST';
import SPELLS_ROGUE from './SPELLS_ROGUE';
import SPELLS_SHAMAN from './SPELLS_SHAMAN';
import SPELLS_WARLOCK from './SPELLS_WARLOCK';
import SPELLS_WARRIOR from './SPELLS_WARRIOR';

const ABILITIES = {
  ...SPELLS_OTHERS,
  ...SPELLS_RACIALS,

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

  ...SPELLS_DEATH_KNIGHT,
  ...SPELLS_DEMON_HUNTER,
  ...SPELLS_DRUID,
  ...SPELLS_HUNTER,
  ...SPELLS_MAGE,
  ...SPELLS_MONK,
  ...SPELLS_PALADIN,
  ...SPELLS_PRIEST,
  ...SPELLS_ROGUE,
  ...SPELLS_SHAMAN,
  ...SPELLS_WARLOCK,
  ...SPELLS_WARRIOR,
};

export default indexById(ABILITIES);
