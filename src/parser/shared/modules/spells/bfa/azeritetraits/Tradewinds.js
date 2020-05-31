import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const tradewindsStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [mastery] = calculateAzeriteEffects(SPELLS.TRADEWINDS.id, rank);
  obj.mastery += mastery;
  return obj;
}, {
  mastery: 0,
});

/**
 * Your spells and abilities have a chance to grant you 583 Mastery for 15 sec.
 * When this effect expires it jumps once to a nearby ally, granting them 115 Mastery for 8 sec.
 */
class Tradewinds extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  mastery = 0;
  procs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.TRADEWINDS.id);

    if (!this.active) {
      return;
    }

    const { mastery } = tradewindsStats(this.selectedCombatant.traitsBySpellId[SPELLS.TRADEWINDS.id]);
    this.mastery = mastery;

    this.statTracker.add(SPELLS.TRADEWINDS.id, {
      mastery,
    });
  }

  on_byPlayer_applybuff(event) {
    this.handleBuff(event);
  }

  on_byPlayer_refreshbuff(event) {
    this.handleBuff(event);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.TRADEWINDS_BUFF.id) / this.owner.fightDuration;
  }

  get averageMastery() {
    return (this.mastery * this.uptime).toFixed(0);
  }

  handleBuff(event) {
    if (event.ability.guid === SPELLS.TRADEWINDS_BUFF.id) {
      this.procs += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
        size="flexible"
        tooltip={(
          <>
            {SPELLS.TRADEWINDS.name} grants <strong>{this.mastery} mastery</strong> while active.<br />
            You had <strong>{this.procs} {SPELLS.TRADEWINDS.name} procs</strong> resulting in {formatPercentage(this.uptime)}% uptime.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.TRADEWINDS}>
          <>
            {this.averageMastery} <small>average Mastery</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Tradewinds;
