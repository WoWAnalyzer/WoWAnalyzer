import React from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import SpellIcon from 'common/SpellIcon';
import BoringValue from 'interface/statistics/components/BoringValueText';

import SPELLS from 'common/SPELLS';
import fetchWcl from 'common/fetchWclApi';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType } from 'parser/core/Events';

const IRONBARK_BASE_DR = 0.20;

class Ironbark extends Analyzer {
  get damageReduced() {
    return this.damageTakenDuringIronbark / (1 - IRONBARK_BASE_DR) * IRONBARK_BASE_DR;
  }

  ironbarkCount = 0;
  damageTakenDuringIronbark = 0;

  constructor(options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.IRONBARK), this.onCast);
    this.loadDamageTakenDuringIronbark();
  }

  onCast(event) {
    this.ironbarkCount += 1;
  }

  loadDamageTakenDuringIronbark() {
    fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(IN RANGE FROM type='${EventType.ApplyBuff}' AND ability.id=${SPELLS.IRONBARK.id} AND source.name='${this.selectedCombatant.name}' TO type='${EventType.RemoveBuff}' AND ability.id=${SPELLS.IRONBARK.id} AND source.name='${this.selectedCombatant.name}' GROUP BY target ON target END)`,
    })
      .then((json) => {
        this.damageTakenDuringIronbark = json.entries.reduce((damageTaken, entry) => damageTaken + entry.total, 0);
      })
      .catch(err => {
        throw err;
      });
  }

  statistic() {
    if (this.damageTakenDuringIronbark) {
      return (
        <Statistic
          position={STATISTIC_ORDER.CORE(20)}
          size="flexible"
          tooltip={(
            <>
              This is the average amount of damage you prevented per Ironbark cast. The total damage prevented over your <strong>{this.ironbarkCount} casts</strong> was <strong>{formatNumber(this.damageReduced)}</strong>.
              While this amount is not counted in your healing done, this is equivalent to <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.damageReduced))}%</strong> of your total healing.
            </>
          )}
        >
          <BoringValue label={<><SpellIcon id={SPELLS.IRONBARK.id} /> Average Ironbark mitigation</>}>
            <>
              {formatNumber(this.damageReduced / this.ironbarkCount)}
            </>
          </BoringValue>
        </Statistic>
      );
    } else {
      return '';
    }
  }
}

export default Ironbark;
