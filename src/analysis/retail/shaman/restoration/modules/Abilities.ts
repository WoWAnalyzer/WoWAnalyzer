import { defineMessage } from '@lingui/core/macro';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import ClassAbilities from '../../shared/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { i18n } from '@lingui/core';
import { TIERS } from 'game/TIERS';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../constants';

const totemGCD = 1000;

class Abilities extends ClassAbilities {
  constructor(...args: ConstructorParameters<typeof ClassAbilities>) {
    super(...args);
    this.abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES.map(
      (spell) => spell.id,
    );
  }

  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    const totemCDR = combatant.hasTalent(TALENTS.TOTEMIC_SURGE_TALENT) ? 5 : 0;
    return [
      ...super.spellbook(),
      {
        spell: TALENTS.RIPTIDE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.RIPTIDE_TALENT),
        charges:
          1 +
          combatant.getMultipleTalentRanks(
            //Adjusted to follow the pattern of HST
            TALENTS.ECHO_OF_THE_ELEMENTS_TALENT,
            TALENTS.ELEMENTAL_REVERB_TALENT,
          ),
        cooldown: 6 - (combatant.hasTalent(TALENTS.RIP_CURRENT_TALENT) ? 1 : 0),
        timelineSortIndex: 11,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
          // recommendedEfficiency: combatant.hasTalent(TALENTS.ECHO_OF_THE_ELEMENTS_TALENT)
          //   ? 0.75
          //   : 0.6,
        },
      },
      {
        spell: SPELLS.PURIFY_SPIRIT.id,
        enabled: combatant.hasTalent(TALENTS.IMPROVED_PURIFY_SPIRIT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.HEALING_STREAM_TOTEM.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: combatant.getMultipleTalentRanks(
          TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT,
          TALENTS.HEALING_STREAM_TOTEM_RESTORATION_TALENT,
        ),
        timelineSortIndex: 18,
        enabled:
          combatant.hasTalent(TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT) ||
          combatant.hasTalent(TALENTS.HEALING_STREAM_TOTEM_RESTORATION_TALENT),
        gcd: {
          static: totemGCD,
        },
        cooldown:
          30 -
          (combatant.hasTalent(TALENTS.TOTEMIC_MOMENTUM_TALENT) ? 3 : 0) -
          (combatant.hasTalent(TALENTS.WATER_TOTEM_MASTERY_TALENT) ? 5 : 0) -
          totemCDR,
        castEfficiency: combatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT)
          ? {
              suggestion: false,
              majorIssueEfficiency: 0.7,
              averageIssueEfficiency: 0.8,
              recommendedEfficiency: 0.9,
            }
          : {
              suggestion: false,
              majorIssueEfficiency: 0.6,
              averageIssueEfficiency: 0.7,
              recommendedEfficiency: 0.8,
            },
        healSpellIds: [SPELLS.HEALING_STREAM_TOTEM_HEAL.id],
      },
      {
        spell: [SPELLS.STORMSTREAM_TOTEM.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        timelineSortIndex: 10,
        enabled: combatant.hasTalent(TALENTS.STORMSTREAM_TOTEM_1_RESTORATION_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: TALENTS.HEALING_RAIN_TALENT.id,
        enabled:
          combatant.hasTalent(TALENTS.HEALING_RAIN_TALENT) &&
          !combatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 18,
        timelineSortIndex: 17,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
          majorIssueEfficiency: 0.5,
          averageIssueEfficiency: 0.7,
          recommendedEfficiency: 0.8,
        },
        healSpellIds: [SPELLS.HEALING_RAIN_HEAL.id],
      },
      {
        spell: SPELLS.HEALING_RAIN_TOTEMIC.id,
        enabled: combatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 25,
        timelineSortIndex: 17,
        gcd: null,
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.3,
          // averageIssueEfficiency: 0.5,
          // recommendedEfficiency: 0.7,
        },
        healSpellIds: [SPELLS.HEALING_RAIN_HEAL.id],
      },
      {
        spell: TALENTS.UNLEASH_LIFE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.UNLEASH_LIFE_TALENT),
        buffSpellId: TALENTS.UNLEASH_LIFE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20 - (combatant.has2PieceByTier(TIERS.MID1) ? 3 : 0),
        timelineSortIndex: 5,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
          majorIssueEfficiency: 0.7,
          averageIssueEfficiency: 0.8,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.ASCENDANCE_RESTORATION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ASCENDANCE_RESTORATION_TALENT),
        buffSpellId: TALENTS.ASCENDANCE_RESTORATION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180 - (combatant.hasTalent(TALENTS.FIRST_ASCENDANT_TALENT) ? 60 : 0),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.2,
          // averageIssueEfficiency: 0.5,
          // recommendedEfficiency: 0.8,
        },
        healSpellIds: [SPELLS.ASCENDANCE_HEAL.id, SPELLS.ASCENDANCE_INITIAL_HEAL.id],
      },
      {
        spell: TALENTS.HEALING_TIDE_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HEALING_TIDE_TOTEM_TALENT),
        buffSpellId: TALENTS.HEALING_TIDE_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180 - (combatant.hasTalent(TALENTS.FIRST_ASCENDANT_TALENT) ? 60 : 0) - totemCDR,
        gcd: {
          static: totemGCD,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.2,
          // averageIssueEfficiency: 0.5,
          // recommendedEfficiency: 0.7,
        },
        healSpellIds: [SPELLS.HEALING_TIDE_TOTEM_HEAL.id],
      },
      {
        spell: TALENTS.SPIRIT_LINK_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SPIRIT_LINK_TOTEM_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180 - totemCDR,
        gcd: {
          static: totemGCD,
        },
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.2,
          // averageIssueEfficiency: 0.4,
          // recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.HEALING_WAVE.id,
        timelineSortIndex: 13,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.OTHERS,
        castEfficiency: {
          suggestion: false,
          // casts: (castCount) => castCount.casts - (castCount.healingTwHits || 0),
        },
      },
      {
        spell: SPELLS.HEALING_WAVE.id,
        name: i18n._(
          defineMessage({
            id: 'shaman.restoration.abilities.buffedByTidalWave',
            message: `Tidal Waved ${SPELLS.HEALING_WAVE.name}`,
          }),
        ),
        timelineSortIndex: 13,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.OTHERS,
        castEfficiency: {
          suggestion: false,
          // casts: (castCount) => castCount.healingTwHits || 0,
        },
      },
      {
        spell: TALENTS.CHAIN_HEAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CHAIN_HEAL_TALENT),
        buffSpellId: SPELLS.HIGH_TIDE_BUFF.id,
        category: SPELL_CATEGORY.OTHERS,
        timelineSortIndex: 12,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.LAVA_BURST_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.LAVA_BURST_TALENT),
        buffSpellId: SPELLS.LAVA_SURGE.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        charges: combatant.hasTalent(TALENTS.ECHO_OF_THE_ELEMENTS_TALENT) ? 2 : 1,
        timelineSortIndex: 60,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DOWNPOUR_ABILITY.id,
        enabled: combatant.hasTalent(TALENTS.DOWNPOUR_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 0,
        gcd: {
          base: 1500,
        },
        charges: combatant.hasTalent(TALENTS.DOUBLE_DIP_TALENT) ? 2 : 1,
        timelineSortIndex: 20,
        castEfficiency: {
          suggestion: false,
          // majorIssueEfficiency: 0.2,
          // averageIssueEfficiency: 0.4,
          // recommendedEfficiency: 0.6,
        },
      },
      {
        spell: TALENTS.NATURES_GUARDIAN_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.NATURES_GUARDIAN_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 45 - (combatant.hasTalent(TALENTS.NATURAL_HARMONY_TALENT) ? 15 : 0),
        healSpellIds: [SPELLS.NATURES_GUARDIAN_HEAL.id],
      },
      {
        spell: TALENTS.SUPPORTIVE_IMBUEMENTS_TALENT.id, //SpellID: 457481
        category: SPELL_CATEGORY.HIDDEN, //IDK what that means but I guess, hidden means not listed in Ability summary
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.EARTHLIVING_WEAPON_TALENT.id, //SpellID: 382021
        category: SPELL_CATEGORY.HIDDEN, //IDK what that means but I guess, hidden means not listed in Ability summary
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WATER_SHIELD.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ANCESTRAL_SWIFTNESS_CAST.id,
        enabled: combatant.hasTalent(TALENTS.ANCESTRAL_SWIFTNESS_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
        cooldown: 30,
        castEfficiency: {
          suggestion: false,
          majorIssueEfficiency: 0.7,
          averageIssueEfficiency: 0.8,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.SURGING_TOTEM.id,
        enabled: combatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30 - totemCDR,
        timelineSortIndex: 17,
        gcd: {
          base: 1000,
        },
        healSpellIds: [SPELLS.HEALING_RAIN_TOTEMIC.id],
      },
    ];
  }
}

export default Abilities;
