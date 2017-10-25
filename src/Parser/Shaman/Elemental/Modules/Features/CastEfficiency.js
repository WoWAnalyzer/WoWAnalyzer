import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static SPELL_CATEGORIES = {
    ...CoreCastEfficiency.SPELL_CATEGORIES,
    DOTS: 'Dot',
  };
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.LAVA_BURST,
      charges: 2,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // haste => 8 / (1 + haste)
      // TODO: Add Cooldown with stacks and Lava Surge procs
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.LIQUID_MAGMA_TOTEM_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      isActive: combatant => combatant.hasTalent(SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id),
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.CHAIN_LIGHTNING,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null, // 2 / (1 + haste)
    },
    {
      spell: SPELLS.LAVA_BEAM,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.EARTHQUAKE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.ELEMENTAL_BLAST_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => combatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id),
      getCooldown: haste => 12,
      recommendedCastEfficiency: 0.6,
    },
    {
      spell: SPELLS.ASCENDANCE_TALENT_ELEMENTAL,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id),
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.STORMKEEPER,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
    },
    {
      spell: SPELLS.FIRE_ELEMENTAL,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60 * 5, // TODO: Add Elementalist -> Lava Burst cast ^= -2 sec cd
      recommendedCastEfficiency: 1.0,
      isActive: combatant => !combatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id),
    },
    {
      spell: SPELLS.STORM_ELEMENTAL_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60 * 2.5, // TODO: Add Elementalist -> Lava Burst cast ^= -2 sec cd
      recommendedCastEfficiency: 1.0,
      isActive: combatant => combatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id),
    },
    {
      spell: SPELLS.FLAME_SHOCK,
      category: CastEfficiency.SPELL_CATEGORIES.DOTS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.FROST_SHOCK,
      category: CastEfficiency.SPELL_CATEGORIES.DOTS,
      getCooldown: haste => null,
    },
  ];
}

export default CastEfficiency;
