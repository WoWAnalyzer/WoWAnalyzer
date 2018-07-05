import React from 'react';
import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'Main/LazyLoadStatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import fetchWcl from 'common/fetchWcl';
import Analyzer from 'Parser/Core/Analyzer';

const IRONBARK_BASE_DR = 0.20;
const AOTA_BONUS_DR = 0.02;

class Ironbark extends Analyzer {
  ironbarkDr = 0;
  ironbarkCount = 0;
  damageTakenDuringIronbark = 0;

  constructor(...args) {
    super(...args);
    const aotaRanks = this.selectedCombatant.traitsBySpellId[SPELLS.ARMOR_OF_THE_ANCIENTS.id];
    this.ironbarkDr = IRONBARK_BASE_DR + (AOTA_BONUS_DR * aotaRanks);
  }

  on_byPlayer_cast(event) {
    if(event.ability.guid === SPELLS.IRONBARK.id) {
      this.ironbarkCount ++;
    }
  }

  get damageReduced() {
    return this.damageTakenDuringIronbark / (1 - this.ironbarkDr) * this.ironbarkDr;
  }

  load() {
    return fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(IN RANGE FROM type='applybuff' AND ability.id=${SPELLS.IRONBARK.id} AND source.name='${this.selectedCombatant.name}' TO type='removebuff' AND ability.id=${SPELLS.IRONBARK.id} AND source.name='${this.selectedCombatant.name}' GROUP BY target ON target END)`,
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
        tooltip={
          `This is the average amount of damage you prevented per Ironbark cast. The total damage prevented over your <b>${this.ironbarkCount} casts</b> was <b>${formatNumber(this.damageReduced)}</b>. While this amount is not counted in your healing done, this is equivalent to <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.damageReduced))}%</b> of your total healing.`
        }
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);

}

export default Ironbark;
