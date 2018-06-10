import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.ASCENDANCE_TALENT_ENHANCEMENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1.0,
        },
      },
      {
        spell: SPELLS.DOOM_WINDS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.EARTHEN_SPIKE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.EARTHEN_SPIKE_TALENT.id),
        cooldown: 20,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.FERAL_SPIRIT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.LIGHTNING_BOLT,
        category: Abilities.SPELL_CATEGORIES.OTHERS, // 1.5 / (1 + haste)
      },
      {
        spell: SPELLS.WIND_SHEAR,
        category: Abilities.SPELL_CATEGORIES.OTHERS, // 1.5 / (1 + haste)
      },
      {
        spell: SPELLS.ROCKBITER,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL, // 1.5 / (1 + haste)
      },
      {
        spell: SPELLS.FROSTBRAND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.FROSTBRAND.id), // 1.5 / (1 + haste)
      },
      {
        spell: SPELLS.FLAMETONGUE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL, // 1.5 / (1 + haste)
      },
      {
        spell: SPELLS.STORMSTRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL, // 1.5 / (1 + haste)
      },
      {
        spell: SPELLS.LAVA_LASH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL, // 1.5 / (1 + haste)
      },
      {
        spell: SPELLS.WINDSTRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL, // 1.5 / (1 + haste)
      },
      {
        spell: SPELLS.CRASH_LIGHTNING,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE, // 1.5 / (1 + haste)
      },
      {
        spell: SPELLS.FERAL_LUNGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
      },
      {
        spell: SPELLS.SPIRIT_WALK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
      },
      {
        spell: SPELLS.LIGHTNING_SURGE_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        cooldown: 60,
  },
  {
        spell: SPELLS.ASTRAL_SHIFT,
        buffSpellId: SPELLS.ASTRAL_SHIFT.id,
        cooldown: 90,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      },
    ];
  }
}

export default Abilities;
