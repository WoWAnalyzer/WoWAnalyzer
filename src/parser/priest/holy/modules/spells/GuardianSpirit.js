import React from 'react';

import SPELLS from 'common/SPELLS/index';
import fetchWcl from 'common/fetchWclApi';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import LazyLoadStatisticBox from 'interface/others/LazyLoadStatisticBox';

import Analyzer from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/others/ItemHealingDone';

const DIVINE_HYMN_HEALING_INCREASE = 0.6;

class GuardianSpirit extends Analyzer {
  // This is an approximation. See the reasoning below.
  totalHealingFromGSBuff = 0;

  load() {
    return fetchWcl(`report/tables/healing/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `IN RANGE FROM type='applybuff' AND ability.id=${SPELLS.GUARDIAN_SPIRIT.id} TO type='removebuff' AND ability.id=${SPELLS.GUARDIAN_SPIRIT.id} GROUP BY target ON target END`,
    })
      .then(json => {
        this.totalHealingFromGSBuff = json.entries.reduce(
          // Because this is a % healing increase and we are unable to parse each healing event individually for its effective healing,
          // we need to do some "approximations" using the total overheal in tandem with the total healing. We do not want to naively
          // assume all healing was fully effective, as this would drastically overweight the power of the buff in situations where a
          // lot of overhealing occurs.
          (healingFromBuff, entry) => healingFromBuff + ((entry.total - entry.total / (1 + DIVINE_HYMN_HEALING_INCREASE)) * (entry.total / (entry.total + (entry.overheal || 0)))),
          0);
      });
  }

  statistic() {
    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.GUARDIAN_SPIRIT.id} />}
        value={(
          <ItemHealingDone amount={this.totalHealingFromGSBuff} />
        )}
        label="Guardian Spirit Buff Contribution"
        tooltip={
          `The Guardian Spirit Buff contributed ${formatNumber(this.totalHealingFromGSBuff)} healing. This includes healing from other healers.<br/>
          NOTE: This metric uses an approximation to calculate contribution from the buff due to technical limitations.`
        }
      />
    );
  }
}

export default GuardianSpirit;
