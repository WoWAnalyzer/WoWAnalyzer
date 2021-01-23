import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { formatNumber } from 'common/format';

class DivertedEnergy extends Analyzer {

  conduitRank = 0;
  healingDone = 0;
  overhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.DIVERTED_ENERGY.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.DIVERTED_ENERGY.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DIVERTED_ENERGY_HEAL), this.onDivertedEnergyHeal);
  }

  onDivertedEnergyHeal(event: HealEvent) {
    this.healingDone += event.amount;
    if (event.overheal) {
      this.overhealing += event.overheal;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.COVENANTS}
        size="flexible"
      >
        <ConduitSpellText spell={SPELLS.DIVERTED_ENERGY} rank={this.conduitRank}>
          <ItemHealingDone amount={this.healingDone} /><br />
          {formatNumber(this.overhealing)} <small>Overhealing</small>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default DivertedEnergy;
