import React from 'react';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.activeTimePercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.875,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Your downtime can be improved. Try to Always Be Casting (ABC), this means you should try to reduce the delay between casting spells. If you have to move, try casting something like <SpellLink id={SPELLS.STEADY_SHOT.id} />, since it's castable while moving and doesn't cost any focus. Spells like <SpellLink id={SPELLS.RAPID_FIRE.id} /> and <SpellLink id={SPELLS.ARCANE_SHOT.id} /> are also castable whilst moving and good for single target - for multiple targets <SpellLink id={SPELLS.MULTISHOT_MM.id} /> might take their place. </>)
        .icon('spell_mage_altertime')
        .actual(i18n._(t('hunter.marksmanship.suggestions.alwaysBeCasting.downtime')`${formatPercentage(1 - actual)}% downtime`))
        .recommended(`<${formatPercentage(1 - recommended)}% is recommended`));
  }
}

export default AlwaysBeCasting;
