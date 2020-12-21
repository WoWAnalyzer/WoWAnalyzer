import React from 'react';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.25,
        average: 0.30,
        major: 0.35,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    const boss = this.owner.boss;

    if(!boss || !boss.fight.disableDeathSuggestion) {
      when(this.suggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. If everything is on cooldown, try to use <SpellLink id={SPELLS.BACKSTAB.id} /> or <SpellLink id={SPELLS.SHADOWSTRIKE.id} /> to stay off the energy cap and do some damage.</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`));
    }
  }
}

export default AlwaysBeCasting;
