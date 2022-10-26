import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';

import lowRankSpells  from '../../lowRankSpells';
import * as SPELLS from '../../SPELLS';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD: number[] = [
    SPELLS.FLASH_HEAL, ...lowRankSpells[SPELLS.FLASH_HEAL],
    SPELLS.GREATER_HEAL, ...lowRankSpells[SPELLS.GREATER_HEAL],
    SPELLS.RENEW, ...lowRankSpells[SPELLS.RENEW],
    SPELLS.POWER_WORD_SHIELD, ...lowRankSpells[SPELLS.POWER_WORD_SHIELD],
    SPELLS.BINDING_HEAL, ...lowRankSpells[SPELLS.BINDING_HEAL],
    SPELLS.BINDING_HEAL, ...lowRankSpells[SPELLS.BINDING_HEAL],
    SPELLS.PRAYER_OF_MENDING, ...lowRankSpells[SPELLS.PRAYER_OF_MENDING],
    SPELLS.PRAYER_OF_HEALING, ...lowRankSpells[SPELLS.PRAYER_OF_HEALING],
    SPELLS.CIRCLE_OF_HEALING, ...lowRankSpells[SPELLS.CIRCLE_OF_HEALING],
    SPELLS.DISPEL_MAGIC, ...lowRankSpells[SPELLS.DISPEL_MAGIC],
    SPELLS.PENANCE, ...lowRankSpells[SPELLS.PENANCE],
    SPELLS.PENANCE_HEALING, ...lowRankSpells[SPELLS.PENANCE_HEALING],
    SPELLS.PENANCE_DAMAGE, ...lowRankSpells[SPELLS.PENANCE_DAMAGE],
    SPELLS.DIVINE_HYMN,
    SPELLS.MASS_DISPEL,
    SPELLS.ABOLISH_DISEASE,
    SPELLS.HYMN_OF_HOPE,
    SPELLS.GUARDIAN_SPIRIT,
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
              id: 'priest.holy.suggestions.alwaysBeCasting.downtime',
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
