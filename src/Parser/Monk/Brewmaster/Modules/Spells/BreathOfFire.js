import React from 'react';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

class BreathOfFire extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.BREATH_OF_FIRE_DEBUFF.id) / this.owner.fightDuration;
  }

  get suggestionThreshold() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThreshold)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> uptime can be improved. The associated debuff is a key part of our damage mitigation.</Wrapper>)
          .icon(SPELLS.BREATH_OF_FIRE.icon)
          .actual(`${formatPercentage(actual)}% Breath of Fire uptime`)
          .recommended(`> ${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default BreathOfFire;
