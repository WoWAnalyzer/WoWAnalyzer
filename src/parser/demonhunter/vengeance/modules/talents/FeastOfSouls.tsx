import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { formatNumber, formatPercentage } from 'common/format';
import Events, { HealEvent } from 'parser/core/Events';

//WCL: https://www.warcraftlogs.com/reports/7DNACRhnaKzBfHLM/#fight=1&source=19
class FeastOfSouls extends Analyzer {

  heal = 0;
  overHeal = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FEAST_OF_SOULS_TALENT.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FEAST_OF_SOULS_HEAL), this.onFeastHeal);
  }

  onFeastHeal(event: HealEvent) {
    this.heal += event.amount;
    this.overHeal += event.overheal || 0;
  }

  statistic() {
    const overHealPercent = this.overHeal / (this.overHeal + this.heal);
    return (
      <TalentStatisticBox
        label={undefined}
        icon={undefined}
        talent={SPELLS.FEAST_OF_SOULS_TALENT.id}
        position={STATISTIC_ORDER.CORE(8)}
        value={this.owner.formatItemHealingDone(this.heal)}
        tooltip={(
          <>
            This shows the extra hps that the talent provides.<br />
            <strong>Effective healing:</strong> {formatNumber(this.heal)}<br />
            <strong>Overhealing:</strong> {formatNumber(this.overHeal)} | {formatPercentage(overHealPercent)}%
          </>
        )}
      />
    );
  }
}

export default FeastOfSouls;
