import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import {formatNumber, formatPercentage} from 'common/format';
import {calculateAzeriteEffects} from 'common/stats';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';


const divineRightStats = traits => traits.reduce((strengthSum, trait) => {
  const [strength] = calculateAzeriteEffects(SPELLS.DIVINE_RIGHT.id, trait);
  return strengthSum + strength;
}, 0);

/**
 * When Divine Storm damages an enemy who is below 20% health, your Strength is increased by 419 for 15 sec.
 *
 * Example report: https://www.warcraftlogs.com/reports/yMVXFfhACTwJzKYp#fight=25
 */
class DivineRight extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  strength = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DIVINE_RIGHT.id);
    if (!this.active) {
      return;
    }

    this.strength = divineRightStats(this.selectedCombatant.traitsBySpellId[SPELLS.DIVINE_RIGHT.id]);

    this.statTracker.add(SPELLS.DIVINE_RIGHT_BUFF.id, {
      strength: this.strength,
    });
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DIVINE_RIGHT_BUFF.id) / this.owner.fightDuration;
  }

  get avgstrength() {
    return this.uptime * this.strength;
  }

  statistic() {
    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.DIVINE_RIGHT.id}
        value={(
          <React.Fragment>
            {formatNumber(this.avgstrength)} Average Strength <br />
            {formatPercentage(this.uptime)}% Uptime
          </React.Fragment>
        )}
        tooltip={`Divine Right granted <b>${this.strength}</b> strength for <b>${formatPercentage(this.uptime)}%</b> of the fight.`}
      />
    );
  }
}

export default DivineRight;
