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

import indexById from '../indexById';
import safeMerge from '../safeMerge';

import OTHERS from './OTHERS';
import RACIALS from './RACIALS';
import BFA from './BFA';

import TALENTS_DEATH_KNIGHT from './TALENTS/DEATH_KNIGHT';
import TALENTS_DEMON_HUNTER from './TALENTS/DEMON_HUNTER';
import TALENTS_DRUID from './TALENTS/DRUID';
import TALENTS_HUNTER from './TALENTS/HUNTER';
import TALENTS_MAGE from './TALENTS/MAGE';
import TALENTS_MONK from './TALENTS/MONK';
import TALENTS_PALADIN from './TALENTS/PALADIN';
import TALENTS_PRIEST from './TALENTS/PRIEST';
import TALENTS_ROGUE from './TALENTS/ROGUE';
import TALENTS_SHAMAN from './TALENTS/SHAMAN';
import TALENTS_WARLOCK from './TALENTS/WARLOCK';
import TALENTS_WARRIOR from './TALENTS/WARRIOR';

import DEATH_KNIGHT from './DEATH_KNIGHT';
import DEMON_HUNTER from './DEMON_HUNTER';
import DRUID from './DRUID';
import HUNTER from './HUNTER';
import MAGE from './MAGE';
import MONK from './MONK';
import PALADIN from './PALADIN';
import PRIEST from './PRIEST';
import ROGUE from './ROGUE';
import SHAMAN from './SHAMAN';
import WARLOCK from './WARLOCK';
import WARRIOR from './WARRIOR';

const ABILITIES = {
  // Talents are auto generated
  ...safeMerge(
    TALENTS_DEATH_KNIGHT,
    TALENTS_DEMON_HUNTER,
    TALENTS_DRUID,
    TALENTS_HUNTER,
    TALENTS_MAGE,
    TALENTS_MONK,
    TALENTS_PALADIN,
    TALENTS_PRIEST,
    TALENTS_ROGUE,
    TALENTS_SHAMAN,
    TALENTS_WARLOCK,
    TALENTS_WARRIOR
  ),
  // Talents can be overwritten with custom spell objects
  ...safeMerge(
    OTHERS,
    RACIALS,
    DEATH_KNIGHT,
    DEMON_HUNTER,
    DRUID,
    HUNTER,
    MAGE,
    MONK,
    PALADIN,
    PRIEST,
    ROGUE,
    SHAMAN,
    WARLOCK,
    WARRIOR,
    BFA
  ),
};

export default indexById(ABILITIES);
