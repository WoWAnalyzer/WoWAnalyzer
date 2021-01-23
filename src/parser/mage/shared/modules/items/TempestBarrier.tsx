import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { formatNumber } from 'common/format';

class TempestBarrier extends Analyzer {

  conduitRank = 0;
  damageAbsorbed = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.TEMPEST_BARRIER.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.TEMPEST_BARRIER.id);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.TEMPEST_BARRIER_ABSORB), this.onAbsorb);
  }

  onAbsorb(event: AbsorbedEvent) {
    this.damageAbsorbed += event.amount;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.COVENANTS}
        size="flexible"
      >
        <ConduitSpellText spell={SPELLS.TEMPEST_BARRIER} rank={this.conduitRank}>
          {formatNumber(this.damageAbsorbed)} <small>Damage absorbed</small>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default TempestBarrier;
