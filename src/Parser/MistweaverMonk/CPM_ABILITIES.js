import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
};

const CPM_ABILITIES = [
  {
    spell: SPELLS.RENEWING_MIST,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 8,
  },

  {
    spell: SPELLS.MANA_TEA_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    isActive: combatant => combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id),
  },
  {
    spell: SPELLS.INVOKE_CHIJI_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 270,
    isActive: combatant => combatant.hasTalent(SPELLS.INVOKE_CHIJI_TALENT.id),
  },
  {
    spell: SPELLS.REVIVAL,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: (haste, combatant) => 270 - (combatant.traitsBySpellId[SPELLS.TENDRILS_OF_REVIVAL.id] || 0 ) * 10,
  },
  {
    spell: SPELLS.VELENS_FUTURE_SIGHT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 75,
    isActive: combatant => combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
  },

  {
    spell: SPELLS.EFFUSE,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },


];

export default CPM_ABILITIES;
