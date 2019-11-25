import SPELLS from 'common/SPELLS';

export const mapSpellsToIds = spells => spells.map(spell => spell.id);
export const mapIdsToSpells = ids => ids.map(id => SPELLS[id]);
