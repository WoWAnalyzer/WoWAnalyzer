import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import SPELLS from 'common/SPELLS/classic/paladin';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD: number[] = [
    // List of healing spells on GCD
    SPELLS.FLASH_OF_LIGHT.id,
    SPELLS.HOLY_LIGHT.id,
    SPELLS.HOLY_SHOCK.id,
    SPELLS.AURA_MASTERY.id,
    SPELLS.LAY_ON_HANDS.id,
    // JUDGEMENTS
    SPELLS.JUDGEMENT_OF_CORRUPTION.id,
    SPELLS.JUDGEMENT_OF_JUSTICE.id,
    SPELLS.JUDGEMENT_OF_WISDOM.id,
    SPELLS.JUDGEMENT_OF_LIGHT.id,
    SPELLS.JUDGEMENTS_OF_THE_PURE.id,
    // PROCS & DEF
    SPELLS.SEARING_LIGHT.id,
    SPELLS.DIVINE_SHIELD.id,
    SPELLS.DIVINE_PROTECTION.id,
    SPELLS.DIVINE_PLEA.id,
    SPELLS.SACRED_SHIELD.id,
    // DMG
    SPELLS.CONSECRATION.id,
    SPELLS.SHIELD_OF_RIGHTEOUSNESS.id,
    SPELLS.HOLY_WRATH.id,
    SPELLS.EXORCISM.id,
    SPELLS.HAMMER_OF_JUSTICE.id,
    SPELLS.HAMMER_OF_WRATH.id,
    // BLESSINGS
    SPELLS.BLESSING_OF_KINGS.id,
    SPELLS.BLESSING_OF_MIGHT.id,
    SPELLS.BLESSING_OF_WISDOM.id,
    SPELLS.GREATER_BLESSING_OF_KINGS.id,
    SPELLS.GREATER_BLESSING_OF_MIGHT.id,
    SPELLS.GREATER_BLESSING_OF_WISDOM.id,
    // HANDS
    SPELLS.HAND_OF_FREEDOM.id,
    SPELLS.HAND_OF_PROTECTION.id,
    SPELLS.HAND_OF_RECKONING.id,
    SPELLS.HAND_OF_SALVATION.id,
    SPELLS.HAND_OF_SACRIFICE.id,
    // SEAL
    SPELLS.SEAL_OF_BLOOD.id,
    SPELLS.SEAL_OF_COMMAND.id,
    SPELLS.SEAL_OF_WISDOM.id,
    SPELLS.SEAL_OF_JUSTICE.id,
    SPELLS.SEAL_OF_LIGHT.id,
    SPELLS.SEAL_OF_CORRUPTION.id,
    SPELLS.SEAL_OF_RIGHTEOUSNESS.id,
    SPELLS.SEAL_OF_VENGEANCE.id,
    SPELLS.SEAL_OF_THE_MARTYR.id,
    // AURA
    SPELLS.FROST_RESISTANCE_AURA.id,
    SPELLS.FIRE_RESISTANCE_AURA.id,
    SPELLS.CONCENTRATION_AURA.id,
    SPELLS.DEVOTION_AURA.id,
    SPELLS.RETRIBUTION_AURA.id,
    // FURY
    SPELLS.RIGHTEOUS_FURY.id,
    // LOWRANK HAND
    ...SPELLS.HAND_OF_PROTECTION.lowRanks,
    // LOWRANK AURA
    ...SPELLS.FROST_RESISTANCE_AURA.lowRanks,
    ...SPELLS.FIRE_RESISTANCE_AURA.lowRanks,
    ...SPELLS.DEVOTION_AURA.lowRanks,
    ...SPELLS.RETRIBUTION_AURA.lowRanks,
    // LOWRANK GREATER BLESSINGS
    ...SPELLS.GREATER_BLESSING_OF_MIGHT.lowRanks,
    ...SPELLS.GREATER_BLESSING_OF_WISDOM.lowRanks,
    ...SPELLS.BLESSING_OF_WISDOM.lowRanks,
    ...SPELLS.BLESSING_OF_MIGHT.lowRanks,
    // LOWRANK HEAL
    ...SPELLS.LAY_ON_HANDS.lowRanks,
    ...SPELLS.HOLY_SHOCK.lowRanks,
    ...SPELLS.HOLY_LIGHT.lowRanks,
    ...SPELLS.FLASH_OF_LIGHT.lowRanks,
    // LOWRANK DMG
    ...SPELLS.CONSECRATION.lowRanks,
    ...SPELLS.EXORCISM.lowRanks,
    ...SPELLS.HOLY_WRATH.lowRanks,
    ...SPELLS.HAMMER_OF_JUSTICE.lowRanks,
    ...SPELLS.HAMMER_OF_WRATH.lowRanks,
  ];

  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage)
      .isGreaterThan(0.25)
      .addSuggestion((suggest, actual, recommended) =>
        suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
          .icon('spell_mage_altertime')
          .actual(
            t({
              id: 'shared.suggestions.alwaysBeCasting.downtime',
              message: `${formatPercentage(actual)}% downtime`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05)
          .major(recommended + 0.05),
      );
  }
}

export default AlwaysBeCasting;
