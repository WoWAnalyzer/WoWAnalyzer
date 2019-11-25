import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import PrimaryStat from 'interface/icons/PrimaryStat';

const unstableCatalystStats = traits => Object.values(traits).reduce((total, rank) => {
  const [stat] = calculateAzeriteEffects(SPELLS.UNSTABLE_CATALYST.id, rank);
  return total + stat;
}, 0);

/**
 * Unstable Catalyst:
 * Your spells and abilities have a chance to leak Azerite on the ground around you.
 * Standing in the Azerite increases your primary stat by 177 for 8 sec.
 */
class UnstableCatalyst extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  stat = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.UNSTABLE_CATALYST.id);
    if (!this.active) {
      return;
    }

    this.stat = unstableCatalystStats(this.selectedCombatant.traitsBySpellId[SPELLS.UNSTABLE_CATALYST.id]);

    this.statTracker.add(SPELLS.UNSTABLE_CATALYST_BUFF.id, {
      strength: this.stat,
      intellect: this.stat,
      agility: this.stat,
    });
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.UNSTABLE_CATALYST_BUFF.id) / this.owner.fightDuration;
  }

  get averageStat() {
    return (this.stat * this.uptime).toFixed(0);
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="small"
        tooltip={(
          <>
            {SPELLS.UNSTABLE_CATALYST.name} grants <strong>{this.stat} {this.selectedCombatant.spec.primaryStat}</strong> while active.<br />
            You had an uptime of {formatPercentage(this.uptime)}%.
          </>
        )}
      >
        <BoringSpellValueText
          spell={SPELLS.UNSTABLE_CATALYST}
        >
          <PrimaryStat stat={this.selectedCombatant.spec.primaryStat} /> {this.averageStat} <small>average {this.selectedCombatant.spec.primaryStat} gained</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default UnstableCatalyst;
