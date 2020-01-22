import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import EventEmitter from 'parser/core/modules/EventEmitter';

const debug = false;

class IneffableTruth extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  buffActive = false;
  lastTimestamp = 0;
  reducedDuration = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasCorruption(318484); // 50 % cdr 
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INEFFABLE_TRUTH), this.setBuffActive);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INEFFABLE_TRUTH), this.setBuffInactive);
    this.addEventListener(EventEmitter.catchAll, this.reduceCooldowns);
  }

  setBuffActive(event) {
    this.buffActive = true;
    this.lastTimestamp = event.timestamp;
  }

  setBuffInactive(event) {
    this.buffActive = false;
    this.log(this.reducedDuration);
  }

  reduceCooldowns(event) {
    if (!this.buffActive) {
      return;
    }

    const reduction = (event.timestamp - this.lastTimestamp) / 2;
    Object.keys(this.spellUsable._currentCooldowns).forEach(cooldown => {
      debug && console.log(cooldown);
      this.spellUsable.reduceCooldown(cooldown, reduction, event.timestamp);
      if (!this.reducedDuration[cooldown]) {
        this.reducedDuration[cooldown] = reduction;
      } else {
        this.reducedDuration[cooldown] += reduction;
      }
    });

    this.lastTimestamp = event.timestamp;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.INEFFABLE_TRUTH.id} />}
        value={`${formatDuration(this.reducedDuration.reduce(( acc, curr ) => acc + curr, 0) / 1000)} min reduced cooldown durations`}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(60)}
        label="Ineffable Truth"
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th> </th>
              <th>Spell</th>
              <th>Reduction</th>
            </tr>
          </thead>
          <tbody>
            {
              Object.entries(this.reducedDuration).map((cd) => (
                <tr>
                  <td><SpellIcon id={cd[0]} /></td>
                  <td><SpellLink id={cd[0]} icon={false} /></td>
                  <td>{formatDuration(cd[1] / 1000)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </StatisticBox>
    );
  }
}

export default IneffableTruth;
