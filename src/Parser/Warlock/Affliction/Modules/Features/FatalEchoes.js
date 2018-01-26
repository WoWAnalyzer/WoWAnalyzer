import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';

const TICKS_PER_UA = 4;

class FatalEchoes extends Analyzer {
  _playerCasts = 0;
  _uasApplied = 0;

  _totalTicks = 0;
  totalDamage = 0;

  on_byPlayer_damage(event) {
    if (UNSTABLE_AFFLICTION_DEBUFF_IDS.includes(event.ability.guid)) {
      this._totalTicks += 1;
      this.totalDamage += event.amount + (event.absorbed || 0);
    }
  }
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.UNSTABLE_AFFLICTION_CAST.id) {
      this._playerCasts += 1;
    }
  }

  on_byPlayer_applydebuff(event) {
    if (UNSTABLE_AFFLICTION_DEBUFF_IDS.includes(event.ability.guid)) {
      this._uasApplied += 1;
    }
  }

  statistic() {
    const totalProcs = this._uasApplied - this._playerCasts;
    const avgDamage = this.totalDamage / (this._totalTicks > 0 ? this._totalTicks : 1);
    const estimatedUAdamage = totalProcs * TICKS_PER_UA * avgDamage;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FATAL_ECHOES.id} />}
        value={`${totalProcs}`}
        label="Fatal Echoes procs"
        tooltip={`${formatNumber(estimatedUAdamage)} damage - ${this.owner.formatItemDamageDone(estimatedUAdamage)} <br />This result is estimated by multiplying number of free Unstable Afflictions from the trait by the average Unstable Affliction damage for the whole fight.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.UNIMPORTANT(0);
}

export default FatalEchoes;
