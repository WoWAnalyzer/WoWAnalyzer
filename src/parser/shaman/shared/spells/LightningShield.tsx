
import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import { formatPercentage } from 'common/format';
import React from 'react';
import SpellLink from 'common/SpellLink';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class LightningShield extends Analyzer {

  /** Returns calculated decimal value of Lightning Shield buff uptime. */
  get lightningShieldUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.LIGHTNING_SHIELD.id) / this.owner.fightDuration;
  }

  /** Returns calculated decimal value of Earth Shield buff uptime. */
  get earthShieldUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.EARTH_SHIELD.id) / this.owner.fightDuration;
  }

  /** Returns a Threshold-compatible object based on the values from lightningShieldUptime() and earthShieldUptime(). */
  get elementalShieldUptimeThreshold() {
    return {
      actual: this.lightningShieldUptime + this.earthShieldUptime,
      isLessThan: {
        minor: 0.95,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.elementalShieldUptimeThreshold)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Remember to have <SpellLink id={SPELLS.LIGHTNING_SHIELD.id} /> or <SpellLink id={SPELLS.EARTH_SHIELD.id} /> up as much as possible. As a 30 minute buff, one should always be cast before combat as well as just after a death, if possible.</span>)
          .icon(SPELLS.LIGHTNING_SHIELD.icon)
          .actual(`${formatPercentage(actual)}% Elemental Shield uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }
}

export default LightningShield;
