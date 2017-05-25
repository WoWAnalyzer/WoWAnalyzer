import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
  UTILITY: 'Utility',
};

const CPM_ABILITIES = [
  // Rotational Spells
  {
    spell: SPELLS.RENEWING_MIST,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 8,
  },
  {
    spell: SPELLS.THUNDER_FOCUS_TEA,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 30,
  },
  {
    spell: SPELLS.CHI_BURST_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 30,
  },

  // Cooldowns
  {
    spell: SPELLS.MANA_TEA_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    isActive: combatant => combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id),
  },
  {
    spell: SPELLS.INVOKE_CHIJI_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    isActive: combatant => combatant.hasTalent(SPELLS.INVOKE_CHIJI_TALENT.id),
  },
  {
    spell: SPELLS.REVIVAL,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: (haste, combatant) => 180 - (combatant.traitsBySpellId[SPELLS.TENDRILS_OF_REVIVAL.id] || 0 ) * 10,
  },
  {
    spell: SPELLS.VELENS_FUTURE_SIGHT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 75,
    isActive: combatant => combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
  },

  // Other Spell Casting Metrics
  {
    spell: SPELLS.EFFUSE,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },

  // Utility Spells
];

export default CPM_ABILITIES;
