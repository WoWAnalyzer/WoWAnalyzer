import SPELLS from 'common/SPELLS';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import { STORMSTRIKE_CAST_SPELLS } from '../constants';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.ASCENDANCE_TALENT_ENHANCEMENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id),
        damageSpellIds: [SPELLS.ASCENDANCE_INITIAL_DAMAGE.id],
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1.0,
        },
      },
      {
        spell: SPELLS.FERAL_SPIRIT,
        buffSpellId: [ //Feral Spirit isn't an actual buff, so we can only show the Elemental
          // Spirits buffs
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
        spell: SPELLS.EARTH_ELEMENTAL,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 300,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
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
        spell: SPELLS.CHAIN_LIGHTNING,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ELEMENTAL_BLAST_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id),
        cooldown: 12,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.WIND_SHEAR,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 12,
        gcd: undefined,
      },
      {
        name: `${SPELLS.FLAME_SHOCK.name} / ${SPELLS.FROST_SHOCK.name}`,
        spell: [SPELLS.FROST_SHOCK, SPELLS.FLAME_SHOCK],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: STORMSTRIKE_CAST_SPELLS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 7.5 / (1 + haste),
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
        cooldown: haste => 12 / (1 + haste),
      },
      {
        spell: SPELLS.CRASH_LIGHTNING,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: haste => 9 / (1 + haste),
      },
      {
        spell: SPELLS.LIGHTNING_BOLT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STORMKEEPER_TALENT_ENHANCEMENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.STORMKEEPER_TALENT_ENHANCEMENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.FERAL_LUNGE_TALENT,
        enabled: combatant.hasTalent(SPELLS.FERAL_LUNGE_TALENT),
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WINDFURY_TOTEM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1000,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1,
        },
      },
      {
        spell: SPELLS.SPIRIT_WALK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        gcd: undefined,
      },
      {
        spell: SPELLS.GHOST_WOLF,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
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
        spell: SPELLS.EARTHBIND_TOTEM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 30,
      },
      {
        spell: SPELLS.TREMOR_TOTEM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
      },
      {
        spell: SPELLS.WIND_RUSH_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WIND_RUSH_TOTEM_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 120,
      },
      {
        spell: SPELLS.PURGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HEX,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CLEANSE_SPIRIT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
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
        spell: SPELLS.SUNDERING_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SUNDERING_TALENT.id),
        cooldown: 40,
      },
      {
        spell: SPELLS.FIRE_NOVA_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.FIRE_NOVA_TALENT.id),
        cooldown: haste => 15 / (1 + haste),
      },
      {
        spell: SPELLS.ICE_STRIKE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.ICE_STRIKE_TALENT.id),
        cooldown: haste => 15 / (1 + haste),
      },
      {
        spell: SPELLS.LIGHTNING_SHIELD,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0,
        },
      },
      {
        spell: SPELLS.REINCARNATION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: undefined,
      },
      {
        spell: [SPELLS.BLOODLUST, SPELLS.HEROISM],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: undefined,
        isUndetectable: true,
      },
      {
        spell: SPELLS.HEALING_STREAM_TOTEM_CAST,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          static: 1000,
        },
        cooldown: 30,
        healSpellIds: [SPELLS.HEALING_STREAM_TOTEM_HEAL.id],
      },
      {
        spell: SPELLS.CHAIN_HEAL,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HEALING_SURGE,
        gcd: {
          base: 1500,
        },
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
    ];
  }
}

export default Abilities;
