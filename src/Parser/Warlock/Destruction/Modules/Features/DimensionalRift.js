import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import { STATISTIC_ORDER } from 'Main/StatisticBox';
import StatisticsListBox from 'Main/StatisticsListBox';

const FLAME_RIFT = 'Flame Rift';
const CHAOS_TEAR = 'Chaos Tear';
const SHADOWY_TEAR = 'Shadowy Tear';
const UNSTABLE_TEAR = 'Unstable Tear';

class DimensionalRift extends Analyzer {
  _riftDetails = {
    [FLAME_RIFT]: {
      ...SPELLS.SEARING_BOLT_RIFT,
    },

    [CHAOS_TEAR]: {
      ...SPELLS.CHAOS_BOLT_RIFT,
    },

    [SHADOWY_TEAR]: {
      ...SPELLS.SHADOW_BOLT_RIFT,
    },

    [UNSTABLE_TEAR]: {
      ...SPELLS.CHAOS_BARRAGE_RIFT,
    },
  };
  _rifts = {};

  on_initialized() {
    this.owner.playerPets.filter(pet => this._riftDetails[pet.name]).forEach((pet) => {
      this._rifts[pet.id] = {
        ...this._riftDetails[pet.name],
        damage: 0,
      };
    });
  }

  on_damage(event) {
    if (!this._rifts[event.sourceID]) {
      return;
    }

    this._rifts[event.sourceID].damage += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    const rifts = Object.keys(this._rifts).map(id => this._rifts[id]);
    const totalDmg = rifts.reduce((sum, rift) => sum + rift.damage, 0);
    return (
      <StatisticsListBox
        title={<span><SpellIcon id={SPELLS.DIMENSIONAL_RIFT_CAST.id} /> Dimensional Rift</span>}
        tooltip={`Your Dimensional Rifts did ${formatNumber(totalDmg)} total damage (${this.owner.formatItemDamageDone(totalDmg)}).`}
      >
        {rifts.map(rift => (
          <div className="flex">
            <div className="flex-main">
              <SpellLink id={rift.id} />
            </div>
            <div className="flex-sub text-right">
              {formatNumber(rift.damage)} ({formatPercentage(rift.damage / totalDmg)} %)
            </div>
          </div>
        ))}
      </StatisticsListBox>
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(6);
}

export default DimensionalRift;
