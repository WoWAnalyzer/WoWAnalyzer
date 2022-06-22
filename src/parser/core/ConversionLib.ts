import Spell from 'common/SPELLS/Spell';

export function convertToSpellID(toID: number | Spell): number {
  let spellId = toID;
  const spellObj = toID as Spell;
  if (spellObj.id) {
    spellId = spellObj.id;
  }

  return spellId as number;
}
