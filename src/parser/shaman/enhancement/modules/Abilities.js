import SPELLS from 'common/SPELLS';

import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
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
        spell: SPELLS.EARTHEN_SPIKE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.EARTHEN_SPIKE_TALENT.id),
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.TOTEM_MASTERY_TALENT_ENHANCEMENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.TOTEM_MASTERY_TALENT_ENHANCEMENT.id),
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.FERAL_SPIRIT,
        buffSpellId: [ //Feral Spirit isn't an actual buff, so we can only show the Elemental Spirits buffs
          SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON.id,
          SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE.id,
          SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE.id,
        ],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: combatant.hasTalent(SPELLS.ELEMENTAL_SPIRITS_TALENT) ? 90 : 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.LIGHTNING_BOLT_ENHANCE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WIND_SHEAR,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 12,
        gcd: null,
      },
      {
        spell: SPELLS.ROCKBITER,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => (combatant.hasTalent(SPELLS.BOULDERFIST_TALENT.id) ? 0.85*6 : 6) / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FROSTBRAND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,

        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLAMETONGUE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STORMSTRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 9 / (1+haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LAVA_LASH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WINDSTRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: 2,
        cooldown: 9,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CRASH_LIGHTNING,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        cooldown: 6,
      },
      {
        spell: SPELLS.FERAL_LUNGE,
        enabled: combatant.hasTalent(SPELLS.FERAL_LUNGE_TALENT),
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
      },
      {
        spell: SPELLS.FERAL_LUNGE_TALENT,
        enabled: combatant.hasTalent(SPELLS.FERAL_LUNGE_TALENT),
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
      },
      {
        spell: SPELLS.SPIRIT_WALK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
      },
      {
        spell: SPELLS.CAPACITOR_TOTEM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
      },
      {
        spell: SPELLS.HEALING_SURGE_ENHANCE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.GHOST_WOLF,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ASTRAL_SHIFT,
        buffSpellId: SPELLS.ASTRAL_SHIFT.id,
        cooldown: 90,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        isDefensive: true,
      },
      {
        spell: SPELLS.FURY_OF_AIR_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.FURY_OF_AIR_TALENT.id),
      },
      {
        spell: SPELLS.SUNDERING_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SUNDERING_TALENT.id),
        cooldown: 40,
      },
      {
        spell: SPELLS.LIGHTNING_SHIELD_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.LIGHTNING_SHIELD_TALENT.id),
      },
      {
        spell: SPELLS.REINCARNATION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BLOODLUST,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: null,
      },
      {
        spell: SPELLS.HEROISM,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: null,
      },
      {
        spell: SPELLS.ASCENDANCE_TALENT_ENHANCEMENT,
        buffSpellId: SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id),
        cooldown: 180,
      },
      {
        spell: SPELLS.BERSERKING,
        buffSpellId: SPELLS.BERSERKING.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isUndetectable: true,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: [SPELLS.BLOOD_FURY_PHYSICAL, SPELLS.BLOOD_FURY_SPELL_AND_PHYSICAL, SPELLS.BLOOD_FURY_SPELL],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        isUndetectable: true,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
      },
    ];
  }
}

export default Abilities;
