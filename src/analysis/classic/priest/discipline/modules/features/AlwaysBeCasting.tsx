import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import SPELLS from 'common/SPELLS/classic/priest';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD: number[] = [
    // List of healing spells on GCD
    SPELLS.POWER_WORD_SHIELD.id,
    ...SPELLS.POWER_WORD_SHIELD.lowRanks,
    SPELLS.PRAYER_OF_MENDING.id,
    ...SPELLS.PRAYER_OF_MENDING.lowRanks,
    SPELLS.PENANCE_HEALING.id,
    SPELLS.FLASH_HEAL.id,
    ...SPELLS.FLASH_HEAL.lowRanks,
    SPELLS.BINDING_HEAL.id,
    ...SPELLS.BINDING_HEAL.lowRanks,
    SPELLS.RENEW.id,
    ...SPELLS.RENEW.lowRanks,
    SPELLS.GREATER_HEAL.id,
    ...SPELLS.GREATER_HEAL.lowRanks,
    SPELLS.HEAL.id,
    ...SPELLS.HEAL.lowRanks,
    SPELLS.LESSER_HEAL.id,
    ...SPELLS.LESSER_HEAL.lowRanks,
    SPELLS.PRAYER_OF_HEALING.id,
    ...SPELLS.PRAYER_OF_HEALING.lowRanks,
    SPELLS.HOLY_NOVA.id,
    ...SPELLS.HOLY_NOVA.lowRanks,
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
