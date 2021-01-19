import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';
import React from 'react';
import Events, { HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'interface/ItemHealingDone';

class ReversalOfFortune extends Analyzer {

  conduitRank = 0;
  healingDone = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.REJUVENATING_WIND_CONDUIT.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.REJUVENATING_WIND_CONDUIT.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATING_WIND_BUFF), this.onHeal);
  }

  onHeal(event: HealEvent) {
    this.healingDone += event.amount || 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spell={SPELLS.REJUVENATING_WIND_CONDUIT} rank={this.conduitRank}>
          <>
            <ItemHealingDone amount={this.healingDone} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }

}

export default ReversalOfFortune;
