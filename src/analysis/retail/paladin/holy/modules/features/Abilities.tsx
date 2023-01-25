import { Trans } from '@lingui/macro';
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
    const hasSanctifiedWrath = combatant.hasTalent(TALENTS.SANCTIFIED_WRATH_TALENT);
    const hasUnbreakable = combatant.hasTalent(TALENTS.UNBREAKABLE_SPIRIT_TALENT);
    const unbreakable = (baseCD: number) => {
      if (hasUnbreakable) {
        return baseCD * (1 - UNBREAKABLE_CDR);
      }
      return baseCD;
    };

    return [
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
          extraSuggestion: (
            <Trans id="paladin.holy.modules.abilities.castHolyShockRegularly">
              Casting Holy Shock regularly is very important for performing well.
            </Trans>
          ),
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 0,
        enabled: combatant.hasTalent(TALENTS.HOLY_SHOCK_TALENT),
        isDefensive: true,
      },
      {
        spell: TALENTS.LIGHT_OF_DAWN_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 1,
        enabled: combatant.hasTalent(TALENTS.LIGHT_OF_DAWN_TALENT),
      },
      {
        spell: [SPELLS.JUDGMENT_CAST_HOLY.id, SPELLS.JUDGMENT_CAST.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: hasted(12),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS.JUDGMENT_OF_LIGHT_TALENT),
          extraSuggestion: (
            <Trans id="paladin.holy.modules.abilities.judgmentOfLightTalent">
              You should cast it whenever <SpellLink id={TALENTS.JUDGMENT_OF_LIGHT_TALENT} /> has
              dropped, which is usually on cooldown without delay. Alternatively you can ignore the
              debuff and just cast it whenever Judgment is available; there's nothing wrong with
              ignoring unimportant things to focus on important things.
            </Trans>
          ),
          recommendedEfficiency: 0.2,
        },
        timelineSortIndex: 20,
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
        timelineSortIndex: 3,
        enabled: combatant.hasTalent(TALENTS.BESTOW_FAITH_TALENT),
      },
      {
        spell: TALENTS.LIGHTS_HAMMER_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
        enabled: combatant.hasTalent(TALENTS.LIGHTS_HAMMER_TALENT),
      },
      {
        spell: TALENTS.BEACON_OF_VIRTUE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 25,
        enabled: combatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT),
      },
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
            <Trans id="paladin.holy.modules.abilities.crusadersMightTalent">
              When you are using <SpellLink id={TALENTS.CRUSADERS_MIGHT_TALENT} /> it is important
              to use <SpellLink id={SPELLS.CRUSADER_STRIKE} /> often enough to benefit from the
              talent. Use a different talent if you are unable to.
            </Trans>
          ),
          recommendedEfficiency: 0.35,
        },
        timelineSortIndex: 50,
      },
      {
        spell: TALENTS.HOLY_PRISM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 4,
        enabled: combatant.hasTalent(TALENTS.HOLY_PRISM_TALENT),
        isDefensive: true,
      },
      {
        spell: TALENTS.RULE_OF_LAW_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: undefined,
        charges: 2,
        timelineSortIndex: 11,
        enabled: combatant.hasTalent(TALENTS.RULE_OF_LAW_TALENT),
      },
      {
        spell: TALENTS.DIVINE_PROTECTION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: unbreakable(60),
        gcd: undefined,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 45,
        isDefensive: true,
        enabled: combatant.hasTalent(TALENTS.DIVINE_PROTECTION_TALENT),
      },
      {
        spell: SPELLS.DIVINE_SHIELD.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: unbreakable(5 * 60),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 46,
        isDefensive: true,
      },
      {
        spell: TALENTS.HOLY_AVENGER_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(TALENTS.HOLY_AVENGER_TALENT),
        timelineSortIndex: 33,
      },
      {
        spell: SPELLS.AVENGING_WRATH.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 32,
        enabled:
          !combatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT) &&
          combatant.hasTalent(TALENTS.AVENGING_WRATH_TALENT),
      },
      {
        spell: TALENTS.AVENGING_CRUSADER_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 32,
        enabled:
          combatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT) &&
          combatant.hasTalent(TALENTS.AVENGING_WRATH_TALENT),
      },
      {
        spell: SPELLS.AURA_MASTERY.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS.UNWAVERING_SPIRIT_TALENT) ? 150 : 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
        },
        timelineSortIndex: 34,
      },
      {
        spell: TALENTS.BLESSING_OF_SACRIFICE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS.SACRIFICE_OF_THE_JUST_TALENT) ? 60 : 120,
        gcd: undefined,
        timelineSortIndex: 101,
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_SACRIFICE_TALENT),
      },
      {
        spell: TALENTS.LAY_ON_HANDS_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: unbreakable(600),
        gcd: undefined,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.1,
        },
        timelineSortIndex: 101,
        isDefensive: true,
        enabled: combatant.hasTalent(TALENTS.LAY_ON_HANDS_TALENT),
      },
      {
        spell: TALENTS.LIGHT_OF_THE_MARTYR_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 19,
      },
      {
        spell: SPELLS.FLASH_OF_LIGHT.id,
        category: SPELL_CATEGORY.OTHERS,
        channel: (haste) => 1.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          name: `Filler ${SPELLS.FLASH_OF_LIGHT.name}`,
          casts: (castCount) => castCount.casts - (castCount.healingIolHits || 0),
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.FLASH_OF_LIGHT.id,
        category: SPELL_CATEGORY.OTHERS,
        channel: (haste) => 1.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          name: `${SPELLS.INFUSION_OF_LIGHT.name} ${SPELLS.FLASH_OF_LIGHT.name}`,
          casts: (castCount) => castCount.healingIolHits || 0,
        },
        timelineSortIndex: 10,
      },
      {
        spell: TALENTS.HOLY_LIGHT_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          name: `Filler ${TALENTS.HOLY_LIGHT_TALENT.name}`,
          casts: (castCount) => castCount.casts - (castCount.healingIolHits || 0),
        },
        timelineSortIndex: 2,
        enabled: combatant.hasTalent(TALENTS.HOLY_LIGHT_TALENT),
      },
      {
        spell: TALENTS.HOLY_LIGHT_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          name: `${SPELLS.INFUSION_OF_LIGHT.name} ${TALENTS.HOLY_LIGHT_TALENT.name}`,
          casts: (castCount) => castCount.healingIolHits || 0,
        },
        timelineSortIndex: 2,
        enabled: combatant.hasTalent(TALENTS.HOLY_LIGHT_TALENT),
      },
      {
        spell: SPELLS.WORD_OF_GLORY.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 2,
      },
      {
        spell: TALENTS.DIVINE_STEED_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(TALENTS.CAVALIER_TALENT) ? 2 : 1,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 44,
        isDefensive: true,
        enabled: combatant.hasTalent(TALENTS.DIVINE_STEED_TALENT),
      },
      {
        spell: SPELLS.CLEANSE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 100,
        isDefensive: true,
      },
      {
        spell: TALENTS.BLESSING_OF_FREEDOM_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 102,
        isDefensive: true,
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_FREEDOM_TALENT),
      },
      {
        spell: TALENTS.BLESSING_OF_PROTECTION_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.IMPROVED_BLESSING_OF_PROTECTION_TALENT)
          ? 4 * 60
          : 5 * 60,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 103,
        isDefensive: true,
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_PROTECTION_TALENT),
      },
      {
        spell: SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 110,
      },
      {
        // The primary beacon cast is registered as BEACON_OF_LIGHT_CAST_AND_BUFF
        spell: [TALENTS.BEACON_OF_FAITH_TALENT.id, SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 110,
        enabled: combatant.hasTalent(TALENTS.BEACON_OF_FAITH_TALENT),
      },
      {
        spell: SPELLS.CONSECRATION_CAST.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        cooldown: hasted(9),
        timelineSortIndex: 51,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        timelineSortIndex: 52,
      },
      {
        spell: TALENTS.BLINDING_LIGHT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        timelineSortIndex: 104,
        enabled: combatant.hasTalent(TALENTS.BLINDING_LIGHT_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HAMMER_OF_JUSTICE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        timelineSortIndex: 105,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HAND_OF_RECKONING.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: undefined,
        timelineSortIndex: 106,
      },
      {
        spell: TALENTS.SERAPHIM_TALENT.id,
        buffSpellId: TALENTS.SERAPHIM_TALENT.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SERAPHIM_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },
    ];
  }
}

export default Abilities;
