
import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import { formatPercentage } from '../../../../common/format';

class LightningShield extends Analyzer {

  /** Returns calculated decimal value of Lightning Shield buff uptime. */
  get lightningShieldUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.LIGHTNING_SHIELD.id) / this.owner.fightDuration;
  }

  /** Returns a Threshold-compatible object based on the value from lightningShieldUptime(). */
  get lightningShieldUptimeThreshold() {
    return {
      actual: this.lightningShieldUptime,
      isLessThan: {
        major: 0.95,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.lightningShieldUptimeThreshold)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest('Remember to have Lightning Shield up constantly, as its generation of Maelstrom Weapon charges is vital to optimal DPS.')
          .icon(SPELLS.LIGHTNING_SHIELD.icon)
          .actual(`${formatPercentage(actual)}% Lightning Shield uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default LightningShield;
