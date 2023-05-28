import Spell from 'common/SPELLS/Spell';

/**
 * A simple function to convert spell objects or numbers to spell ID
 *
 * @param toID The Spell you want to become an ID
 * @returns the id as a number
 */
export function convertToSpellID(toID: number | Spell): number {
  let spellId = toID;
  const spellObj = toID as Spell;
  if (spellObj.id) {
    spellId = spellObj.id;
  }

  return spellId as number;
}
