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

import DEATH_KNIGHT from './deathknight';
import DEMON_HUNTER from './demonhunter';
import DRUID from './druid';
import ENCOUNTER from './encounter';
import EVOKER from './evoker';
import HUNTER from './hunter';
import MAGE from './mage';
import MONK from './monk';
import OTHERS from './others';
import PALADIN from './paladin';
import PRIEST from './priest';
import RACIALS from './racials';
import ROGUE from './rogue';
import SHADOWLANDS from './shadowlands';
import SHAMAN from './shaman';
import Spell from './Spell';
import TALENTS_DEATH_KNIGHT from './talents/deathknight';
import TALENTS_DEMON_HUNTER from './talents/demonhunter';
import TALENTS_DRUID from './talents/druid';
import TALENTS_EVOKER from './talents/evoker';
import TALENTS_HUNTER from './talents/hunter';
import TALENTS_MAGE from './talents/mage';
import TALENTS_MONK from './talents/monk';
import TALENTS_PALADIN from './talents/paladin';
import TALENTS_PRIEST from './talents/priest';
import TALENTS_ROGUE from './talents/rogue';
import TALENTS_SHAMAN from './talents/shaman';
import TALENTS_WARLOCK from './talents/warlock';
import TALENTS_WARRIOR from './talents/warrior';
import WARLOCK from './warlock';
import WARRIOR from './warrior';

const ABILITIES = {
  // Talents are auto generated
  ...TALENTS_DEATH_KNIGHT,
  ...TALENTS_DEMON_HUNTER,
  ...TALENTS_DRUID,
  ...TALENTS_EVOKER,
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
  ...EVOKER,
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

// If you remove this indexById you can see what spells are undefined.
// But you'll get a lot of other errors.
// We should type indexById properly some day to make this standard.
// And then fix all those errors.
// Which will prevent bugs.
const InternalSpellTable = indexById(ABILITIES);
// assignment is used here to avoid potential performance pitfalls when
// compiling the spread operator on large objects.
InternalSpellTable.maybeGet = (key: string | number | undefined): Spell | undefined =>
  key ? InternalSpellTable[key] : undefined;

const SPELLS = new Proxy(InternalSpellTable, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);

    if (value === undefined) {
      if (process.env.NODE_ENV === 'production') {
        console.error(
          'Attempted to retrieve invalid or missing spell from SPELLS. If this is expected, use SPELLS.maybeGet.',
          prop,
          target,
        );
      } else {
        throw new Error(
          `Attempted to retrieve invalid or missing spell from SPELLS: ${String(
            prop,
          )}. If this is expected, use SPELLS.maybeGet.`,
        );
      }
    }

    return value;
  },
});

export default SPELLS;

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
