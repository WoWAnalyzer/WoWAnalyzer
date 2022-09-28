import { AdaptiveSwarmDamageDealer } from 'analysis/retail/druid/shared';
import SPELLS from 'common/SPELLS';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';

/**
 * Feral's display module for Adaptive Swarm - standard damage dealer plus also the uptime stat
 */
class AdaptiveSwarmFeral extends AdaptiveSwarmDamageDealer {
  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.ADAPTIVE_SWARM],
        uptimes: this.damageUptimeHistory,
      },
      [],
      SubPercentageStyle.RELATIVE,
    );
  }
}

export default AdaptiveSwarmFeral;
