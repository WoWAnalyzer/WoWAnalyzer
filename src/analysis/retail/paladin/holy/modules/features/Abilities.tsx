import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../constants';
import { TrackedPaladinAbility } from '../core/PaladinAbilityTracker';

const UNBREAKABLE_CDR = 0.3;

function hasted(baseCD: number) {
  return (haste: number) => baseCD / (1 + haste);
}

class Abilities extends CoreAbilities {
  constructor(...args: ConstructorParameters<typeof CoreAbilities>) {
    super(...args);
    this.abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;
  }

  spellbook(): Array<SpellbookAbility<TrackedPaladinAbility>> {
    const combatant = this.selectedCombatant;
    const hasSanctifiedWrath = combatant.hasTalent(TALENTS.SANCTIFIED_WRATH_HOLY_TALENT);
    const hasUnbreakable = combatant.hasTalent(TALENTS.UNBREAKABLE_SPIRIT_TALENT);
    const unbreakable = (baseCD: number) => {
      if (hasUnbreakable) {
        return baseCD * (1 - UNBREAKABLE_CDR);
      }
      return baseCD;
    };

    return [
      // Class Wide Abilities
      // Core
      {
        spell: SPELLS.CRUSADER_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: hasted(6),
        charges: combatant.hasTalent(TALENTS.RADIANT_ONSLAUGHT_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS.CRUSADERS_MIGHT_TALENT),
          extraSuggestion: (
            <>
              When you are using <SpellLink spell={TALENTS.CRUSADERS_MIGHT_TALENT} /> it is
              important to use <SpellLink spell={SPELLS.CRUSADER_STRIKE} /> often enough to benefit
              from the talent. Use a different talent if you are unable to.
            </>
          ),
          recommendedEfficiency: 0.35,
        },
      },
      {
        spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
      },
      {
        spell: [SPELLS.JUDGMENT_CAST_HOLY.id, SPELLS.JUDGMENT_CAST.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: hasted(12 - combatant.getTalentRank(TALENTS.SEAL_OF_ALACRITY_TALENT) * 0.5),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS.JUDGMENT_OF_LIGHT_TALENT),
          extraSuggestion: (
            <>
              You should cast it whenever <SpellLink spell={TALENTS.JUDGMENT_OF_LIGHT_TALENT} /> has
              dropped, which is usually on cooldown without delay. Alternatively you can ignore the
              debuff and just cast it whenever Judgment is available; there's nothing wrong with
              ignoring unimportant things to focus on important things.
            </>
          ),
          recommendedEfficiency: 0.2,
        },
      },
      {
        spell: SPELLS.FLASH_OF_LIGHT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HAMMER_OF_JUSTICE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CONSECRATION_CAST.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        cooldown: hasted(9),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WORD_OF_GLORY.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HAND_OF_RECKONING.id,
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 8,
      },
      {
        spell: SPELLS.DIVINE_SHIELD.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: unbreakable(5 * 60),
        gcd: {
          base: 1500,
        },
        isDefensive: true,
      },
      {
        spell: SPELLS.SENSE_UNDEAD.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },

      // Tree
      {
        spell: TALENTS.LAY_ON_HANDS_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: unbreakable(60 * 10),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.1,
        },
        enabled: combatant.hasTalent(TALENTS.LAY_ON_HANDS_TALENT),
      },
      {
        spell: TALENTS.BLESSING_OF_FREEDOM_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_FREEDOM_TALENT),
      },
      // Hammer of Wrath -> Check HammerOfWrath.TSX
      {
        spell: [SPELLS.CONCENTRATION_AURA.id, SPELLS.DEVOTION_AURA.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.AURAS_OF_THE_RESOLUTE_TALENT),
      },
      {
        spell: [SPELLS.RETRIBUTION_AURA.id, SPELLS.CRUSADER_AURA.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.AURAS_OF_SWIFT_VENGEANCE_TALENT),
      },
      {
        spell: TALENTS.TURN_EVIL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.TURN_EVIL_TALENT),
      },
      {
        spell: TALENTS.DIVINE_STEED_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(TALENTS.CAVALIER_TALENT) ? 2 : 1,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.DIVINE_STEED_TALENT),
      },
      {
        spell: TALENTS.REBUKE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        enabled: combatant.hasTalent(TALENTS.REBUKE_TALENT),
      },
      {
        spell: TALENTS.REPENTANCE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.REPENTANCE_TALENT),
      },
      {
        spell: TALENTS.BLINDING_LIGHT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BLINDING_LIGHT_TALENT),
      },
      {
        spell: SPELLS.AVENGING_WRATH.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
        enabled:
          !combatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT) &&
          combatant.hasTalent(TALENTS.AVENGING_WRATH_TALENT),
      },
      {
        spell: TALENTS.BLESSING_OF_PROTECTION_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          60 * (combatant.hasTalent(TALENTS.IMPROVED_BLESSING_OF_PROTECTION_TALENT) ? 4 : 5),
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_PROTECTION_TALENT),
      },
      {
        spell: TALENTS.BLESSING_OF_SACRIFICE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60 * (combatant.hasTalent(TALENTS.SACRIFICE_OF_THE_JUST_TALENT) ? 1 : 2),
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_SACRIFICE_TALENT),
      },
      {
        spell: TALENTS.DIVINE_TOLL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS.QUICKENED_INVOCATION_TALENT) ? 45 : 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.DIVINE_TOLL_TALENT),
      },

      // Spec Talents
      // Core
      {
        spell: SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        // The primary beacon cast is registered as BEACON_OF_LIGHT_CAST_AND_BUFF
        spell: TALENTS.BEACON_OF_FAITH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BEACON_OF_FAITH_TALENT),
      },
      {
        spell: SPELLS.CLEANSE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.DIVINE_PROTECTION_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: unbreakable(60),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        isDefensive: true,
        enabled: combatant.hasTalent(TALENTS.DIVINE_PROTECTION_TALENT),
      },
      {
        spell: TALENTS.HOLY_SHOCK_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => {
          const swCdr = hasSanctifiedWrath && combatant.hasBuff(SPELLS.AVENGING_WRATH.id) ? 0.4 : 0;
          return hasted(7.5 * (1 - swCdr))(haste);
        },
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          extraSuggestion: <>Casting Holy Shock regularly is very important for performing well.</>,
          recommendedEfficiency: 0.8,
        },
        enabled: combatant.hasTalent(TALENTS.HOLY_SHOCK_TALENT),
      },
      {
        spell: TALENTS.HOLY_LIGHT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.HOLY_LIGHT_TALENT),
      },
      {
        spell: TALENTS.LIGHT_OF_DAWN_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.LIGHT_OF_DAWN_TALENT),
      },
      {
        spell: TALENTS.BESTOW_FAITH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 12,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.7,
        },
        enabled: combatant.hasTalent(TALENTS.BESTOW_FAITH_TALENT),
      },
      {
        spell: TALENTS.RULE_OF_LAW_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        charges: 2,
        enabled: combatant.hasTalent(TALENTS.RULE_OF_LAW_TALENT),
      },
      {
        spell: TALENTS.AURA_MASTERY_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS.UNWAVERING_SPIRIT_TALENT) ? 150 : 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
        },
        enabled: combatant.hasTalent(TALENTS.AURA_MASTERY_TALENT),
      },
      {
        spell: TALENTS.DIVINE_FAVOR_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.DIVINE_FAVOR_TALENT),
      },
      {
        spell: TALENTS.LIGHT_OF_THE_MARTYR_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.LIGHT_OF_THE_MARTYR_TALENT),
      },
      {
        spell: TALENTS.LIGHTS_HAMMER_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.LIGHTS_HAMMER_TALENT),
      },
      {
        spell: TALENTS.HOLY_PRISM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.HOLY_PRISM_TALENT),
      },
      {
        spell: TALENTS.BARRIER_OF_FAITH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BARRIER_OF_FAITH_TALENT),
      },
      {
        spell: TALENTS.AVENGING_CRUSADER_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT),
      },
      {
        spell: TALENTS.BEACON_OF_VIRTUE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT),
      },
      {
        spell: TALENTS.TYRS_DELIVERANCE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.TYRS_DELIVERANCE_TALENT),
      },
      {
        spell: [
          TALENTS.BLESSING_OF_SUMMER_TALENT.id,
          SPELLS.BLESSING_OF_AUTUMN_TALENT.id,
          SPELLS.BLESSING_OF_SPRING_TALENT.id,
          SPELLS.BLESSING_OF_WINTER_TALENT.id,
        ],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_SUMMER_TALENT),
      },
    ];
  }
}

export default Abilities;
