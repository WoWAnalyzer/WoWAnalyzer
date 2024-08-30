import { defineMessage } from '@lingui/macro';
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
    SPELLS.JUDGEMENT.id,
    // PROCS & DEF
    SPELLS.DIVINE_SHIELD.id,
    SPELLS.DIVINE_PROTECTION.id,
    SPELLS.DIVINE_PLEA.id,
    SPELLS.SACRED_SHIELD.id,
    // DMG
    SPELLS.CONSECRATION.id,
    SPELLS.SHIELD_OF_THE_RIGHTEOUS.id,
    SPELLS.HOLY_WRATH.id,
    SPELLS.EXORCISM.id,
    SPELLS.HAMMER_OF_JUSTICE.id,
    SPELLS.HAMMER_OF_WRATH.id,
    // BLESSINGS
    SPELLS.BLESSING_OF_KINGS.id,
    SPELLS.BLESSING_OF_MIGHT.id,
    SPELLS.BLESSING_OF_WISDOM.id,
    // HANDS
    SPELLS.HAND_OF_FREEDOM.id,
    SPELLS.HAND_OF_PROTECTION.id,
    SPELLS.HAND_OF_RECKONING.id,
    SPELLS.HAND_OF_SALVATION.id,
    SPELLS.HAND_OF_SACRIFICE.id,
    // SEAL
    SPELLS.SEAL_OF_CORRUPTION.id,
    SPELLS.SEAL_OF_INSIGHT.id,
    SPELLS.SEAL_OF_JUSTICE.id,
    SPELLS.SEAL_OF_RIGHTEOUSNESS.id,
    SPELLS.SEAL_OF_TRUTH.id,
    // AURA
    SPELLS.RESISTANCE_AURA.id,
    SPELLS.CONCENTRATION_AURA.id,
    SPELLS.DEVOTION_AURA.id,
    SPELLS.RETRIBUTION_AURA.id,
    // FURY
    SPELLS.RIGHTEOUS_FURY.id,
  ];

  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage)
      .isGreaterThan(0.25)
      .addSuggestion((suggest, actual, recommended) =>
        suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
          .icon('spell_mage_altertime')
          .actual(
            defineMessage({
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
