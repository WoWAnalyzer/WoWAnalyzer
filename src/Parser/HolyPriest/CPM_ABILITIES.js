import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import { calculateMaxCasts } from 'Parser/Core/getCastEfficiency';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
};

const CPM_ABILITIES = [
  // HW:Sanc and HW:Serenity not included due to Serendipity causing an odd situation with their CDs
  {
    spell: SPELLS.PRAYER_OF_MENDING_CAST,
    name: 'Prayer of Mending',
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: (haste, combatant) => ((12 - (combatant.hasTalent(SPELLS.PIETY_TALENT.id) ? 2 : 0)) + 1.5) / (1 + haste), // +1.5 for base cast time
    recommendedCastEfficiency: 0.70, // There's a lot of things that can potentially delay PoM: movement, heavy damage, etc. It is important to maintain high uptime but delaying a few GCDs is not bad.
  },
  {
    spell: SPELLS.LIGHT_OF_TUURE_TRAIT,
    name: 'Light of T\'uure',
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 45,
    getMaxCasts: (cooldown, fightDuration, getAbility, parser) => {
      return calculateMaxCasts(cooldown, fightDuration, 2);
    },
    recommendedCastEfficiency: 0.50, // This spell is a very odd use, most people use it during movement or for tanks during heavy damage, so this does not really need to be super high but it needs to be high enough that you dont sit at 2 charges
  },
  {
    spell: SPELLS.DESPERATE_PRAYER,
    name: 'Desperate Prayer',
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 90, // might remove DP because of the new minor trait causing resets
    recommendedCastEfficiency: 0.50, // It's a personal, so cast efficiency is not super important but it should be used before every threatening damage if possible
  },
  {
    spell: SPELLS.APOTHEOSIS_TALENT,
    name: 'Apotheosis',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    isActive: combatant => combatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id),
  },
  {
    spell: SPELLS.DIVINE_HYMN_CAST,
    name: 'Divine Hymn',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
  },
  {
    spell: SPELLS.DIVINE_STAR_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 15,
    isActive: combatant => combatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id),
  },
  {
    spell: SPELLS.HALO_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 40,
    isActive: combatant => combatant.hasTalent(SPELLS.HALO_TALENT.id),
    getOverhealing: (_, getAbility) => {
      const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.HALO_HEAL.id);
      return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
    },
  },
  {
    spell: SPELLS.CIRCLE_OF_HEALING_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 15 / (1 + haste),
    isActive: combatant => combatant.hasTalent(SPELLS.CIRCLE_OF_HEALING_TALENT.id),
  },

  // Global CPM abilities
  {
    spell: SPELLS.ARCANE_TORRENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    hideWithZeroCasts: true,
  },
  {
    spell: SPELLS.VELENS_FUTURE_SIGHT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 75,
    isActive: combatant => combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
  },
  {
    spell: SPELLS.GNAWED_THUMB_RING,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    isActive: combatant => combatant.hasFinger(ITEMS.GNAWED_THUMB_RING.id),
  },
];

export default CPM_ABILITIES;
