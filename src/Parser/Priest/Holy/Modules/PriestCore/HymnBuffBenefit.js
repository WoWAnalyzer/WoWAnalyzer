import React from 'react';

import SPELLS from 'common/SPELLS';
import fetchWcl from 'common/fetchWcl';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import LazyLoadStatisticBox from 'Main/LazyLoadStatisticBox';

import Analyzer from 'Parser/Core/Analyzer';

const DIVINE_HYMN_HEALING_INCREASE = 0.1;

class HymnBuffBenefit extends Analyzer {
  // This is an approximation. See the reasoning below.
  totalHealingFromHymnBuff = 0;

  load() {
    return fetchWcl(`report/tables/healing/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `IN RANGE FROM type='applybuff' AND ability.id=${SPELLS.DIVINE_HYMN_HEAL.id} TO type='removebuff' AND ability.id=${SPELLS.DIVINE_HYMN_HEAL.id} GROUP BY target ON target END`,
    })
      .then(json => {
        this.totalHealingFromHymnBuff = json.entries.reduce(
          // Because this is a % healing increase and we are unable to parse each healing event individually for its effective healing,
          // we need to do some "approximations" using the total overheal in tandem with the total healing. We do not want to naively
          // assume all healing was fully effective, as this would drastically overweight the power of the buff in situations where a
          // lot of overhealing occurs.
          (healingFromBuff, entry) => healingFromBuff + ((entry.total - entry.total / (1 + DIVINE_HYMN_HEALING_INCREASE)) * (entry.total / (entry.total + (entry.overheal || 0)))),
        0);
      });
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;

    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.DIVINE_HYMN_CAST.id} />}
        value={`≈${formatNumber(this.totalHealingFromHymnBuff / fightDuration * 1000)} HPS`}
        label="Hymn Buff Contribution"
        tooltip={
          `The Divine Hymn buff contributed ${formatNumber(this.totalHealingFromHymnBuff)} healing. This includes healing from other healers.<br/>
          NOTE: This metric uses an approximation to calculate contribution from the buff due to technical limitations.`
        }
      />
    );
  }
}

export default HymnBuffBenefit;
