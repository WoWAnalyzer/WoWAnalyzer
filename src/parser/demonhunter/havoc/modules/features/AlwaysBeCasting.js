import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { formatPercentage } from 'common/format';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.15,
        average: 0.25,
        major: 0.35,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, use your movement spells like <SpellLink id={SPELLS.FEL_RUSH_CAST.id} />, <SpellLink id={SPELLS.FELBLADE_TALENT.id} icon />, or <SpellLink id={SPELLS.VENGEFUL_RETREAT.id} icon /> to quickly get back to the boss.</>)
          .icon('spell_mage_altertime')
          .actual(i18n._(t('demonhunter.havoc.suggestions.alwaysBeCasting.downtime')`${formatPercentage(actual)}% downtime`))
          .recommended(`<${formatPercentage(recommended)}% is recommended`));
    }
  }
}

export default AlwaysBeCasting;
