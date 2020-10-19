import React from 'react';
import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'interface/others/LazyLoadStatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import fetchWcl from 'common/fetchWclApi';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType } from 'parser/core/Events';

const IRONBARK_BASE_DR = 0.20;

class Ironbark extends Analyzer {
  ironbarkCount = 0;
  damageTakenDuringIronbark = 0;

  constructor(options){
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.IRONBARK), this.onCast);
  }

  onCast(event) {
    this.ironbarkCount += 1;
  }

  get damageReduced() {
    return this.damageTakenDuringIronbark / (1 - IRONBARK_BASE_DR) * IRONBARK_BASE_DR;
  }

  load() {
    return fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(IN RANGE FROM type='${EventType.ApplyBuff}' AND ability.id=${SPELLS.IRONBARK.id} AND source.name='${this.selectedCombatant.name}' TO type='${EventType.RemoveBuff}' AND ability.id=${SPELLS.IRONBARK.id} AND source.name='${this.selectedCombatant.name}' GROUP BY target ON target END)`,
    })
      .then((json) => {
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.damageTakenDuringIronbark = json.entries.reduce((damageTaken, entry) => damageTaken + entry.total, 0);
        }
      });
  }

  statistic() {
    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.IRONBARK.id} />}
        value={`${formatNumber(this.damageReduced / this.ironbarkCount)}`}
        label="Average Ironbark Mitigation"
        tooltip={(
          <>
            This is the average amount of damage you prevented per Ironbark cast. The total damage prevented over your <strong>{this.ironbarkCount} casts</strong> was <strong>{formatNumber(this.damageReduced)}</strong>.
            While this amount is not counted in your healing done, this is equivalent to <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.damageReduced))}%</strong> of your total healing.
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);

}

export default Ironbark;
