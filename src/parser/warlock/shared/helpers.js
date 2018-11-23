import SPELLS from 'common/SPELLS';

export const mapSpellsToIds = spells => spells.map(spell => spell.id);
export const mapIdsToSpells = ids => ids.map(id => SPELLS[id]);
export const calculateBonusAzeriteDamage = (event, traitBonus, spellPowerCoefficient, intellect) => {
  const baseDamage = spellPowerCoefficient * intellect;
  const traitPortion = traitBonus / (baseDamage + traitBonus);
  const actualDamage = event.amount + (event.absorbed || 0);
  return actualDamage * traitPortion;
};
