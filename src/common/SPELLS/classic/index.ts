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

import Spell, { Enchant } from '../Spell';
import PRIEST from './priest';
import Engineering from './engineering';

const ABILITIES = {
  ...PRIEST,
  ...Engineering,
} as const;

// type SpellCollection = SpellList & {
//   maybeGet: (key: string | number | undefined) => Spell | undefined;
// };
// If you remove this indexById you can see what spells are undefined.
// But you'll get a lot of other errors.
// We should type indexById properly some day to make this standard.
// And then fix all those errors.
// Which will prevent bugs.
const InternalSpellTable = indexById<Spell | Enchant, typeof ABILITIES>(ABILITIES);
// assignment is used here to avoid potential performance pitfalls when
// compiling the spread operator on large objects.
// InternalSpellTable.maybeGet = (key) => (key ? InternalSpellTable[key] : undefined);

const CLASSIC_SPELLS = new Proxy(InternalSpellTable, {
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
