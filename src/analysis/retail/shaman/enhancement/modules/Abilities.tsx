import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { calculateMaxCasts } from 'parser/core/EventCalculateLib';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import { ESSENTIAL_EXTRACTION_EFFECT_BY_RANK } from '../constants';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
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
        spell: SPELLS.FERAL_SPIRIT.id,
        buffSpellId: [
          //Feral Spirit isn't an actual buff, so we can only show the Elemental
          // Spirits buffs
          SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON.id,
          SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE.id,
          SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE.id,
        ],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(SPELLS.ELEMENTAL_SPIRITS_TALENT) ? 90 : 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.EARTH_ELEMENTAL.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 300,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.EARTHEN_SPIKE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
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
        spell: SPELLS.CHAIN_LIGHTNING.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ELEMENTAL_BLAST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
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
        spell: SPELLS.WIND_SHEAR.id,
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 12,
        gcd: undefined,
      },
      {
        spell: SPELLS.FLAME_SHOCK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FROST_SHOCK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STORMSTRIKE_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 7.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          maxCasts: (cooldown: number) =>
            calculateMaxCasts(
              cooldown,
              this.owner.fightDuration -
                combatant.getBuffUptime(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id),
            ),
        },
      },
      {
        spell: SPELLS.WINDSTRIKE_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 2.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          maxCasts: (cooldown: number) =>
            calculateMaxCasts(
              cooldown,
              combatant.getBuffUptime(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id),
            ),
        },
        enabled: combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id),
      },
      {
        spell: SPELLS.LAVA_LASH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: (haste) => (combatant.hasBuff(SPELLS.HOT_HAND_BUFF.id) ? 3 : 12) / (1 + haste),
      },
      {
        spell: SPELLS.CRASH_LIGHTNING.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: (haste) => 9 / (1 + haste),
      },
      {
        spell: SPELLS.LIGHTNING_BOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STORMKEEPER_TALENT_ENHANCEMENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
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
        spell: SPELLS.FERAL_LUNGE_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.FERAL_LUNGE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WINDFURY_TOTEM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1,
        },
      },
      {
        spell: SPELLS.SPIRIT_WALK.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: undefined,
      },
      {
        spell: SPELLS.GHOST_WOLF.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CAPACITOR_TOTEM.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
      },
      {
        spell: SPELLS.EARTHBIND_TOTEM.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 30,
      },
      {
        spell: SPELLS.TREMOR_TOTEM.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
      },
      {
        spell: SPELLS.WIND_RUSH_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WIND_RUSH_TOTEM_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 120,
      },
      {
        spell: SPELLS.PURGE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HEX.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CLEANSE_SPIRIT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ASTRAL_SHIFT.id,
        buffSpellId: SPELLS.ASTRAL_SHIFT.id,
        cooldown: 90,
        category: SPELL_CATEGORY.DEFENSIVE,
        isDefensive: true,
      },
      {
        spell: SPELLS.SUNDERING_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SUNDERING_TALENT.id),
        cooldown: 40,
      },
      {
        spell: SPELLS.FIRE_NOVA_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.FIRE_NOVA_TALENT.id),
        cooldown: (haste) => 15 / (1 + haste),
      },
      {
        spell: SPELLS.ICE_STRIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.ICE_STRIKE_TALENT.id),
        cooldown: (haste) => 15 / (1 + haste),
      },
      {
        spell: SPELLS.LIGHTNING_SHIELD.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0,
        },
      },
      {
        spell: SPELLS.REINCARNATION.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: undefined,
      },
      {
        spell: [SPELLS.BLOODLUST.id, SPELLS.HEROISM.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: undefined,
        isUndetectable: true,
      },
      {
        spell: SPELLS.HEALING_STREAM_TOTEM_CAST.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          static: 1000,
        },
        cooldown: 30,
        healSpellIds: [SPELLS.HEALING_STREAM_TOTEM_HEAL.id],
      },
      {
        spell: SPELLS.CHAIN_HEAL.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HEALING_SURGE.id,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: SPELLS.FAE_TRANSFUSION.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown:
          120 +
          ESSENTIAL_EXTRACTION_EFFECT_BY_RANK[
            combatant.conduitRankBySpellID(SPELLS.ESSENTIAL_EXTRACTION.id)
          ],
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
      },
      {
        spell: SPELLS.PRIMORDIAL_WAVE_CAST.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1,
        },
      },
      {
        spell: SPELLS.CHAIN_HARVEST.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
      },
      {
        spell: SPELLS.VESPER_TOTEM.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.KYRIAN.id),
      },
    ];
  }
}

export default Abilities;
