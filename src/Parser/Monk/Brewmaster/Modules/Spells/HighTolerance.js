import React from 'react';
import Wrapper from 'common/Wrapper';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const HIGH_TOLERANCE_HASTE = {
  [SPELLS.LIGHT_STAGGER_DEBUFF.id]: 0.08,
  [SPELLS.MODERATE_STAGGER_DEBUFF.id]: 0.12,
  [SPELLS.HEAVY_STAGGER_DEBUFF.id]: 0.15,
};

class HighTolerance extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  staggerDurations = {
    [SPELLS.LIGHT_STAGGER_DEBUFF.id]: 0,
    [SPELLS.MODERATE_STAGGER_DEBUFF.id]: 0,
    [SPELLS.HEAVY_STAGGER_DEBUFF.id]: 0,
  };

  _staggerLevel = null;
  _lastDebuffApplied = 0;

  get meanHaste() {
    return Object.keys(HIGH_TOLERANCE_HASTE)
      .map(key => this.staggerDurations[key] * HIGH_TOLERANCE_HASTE[key])
      .reduce((prev, cur) => prev + cur, 0) / this.owner.fightDuration;
  }

  get lightDuration() {
    return this.staggerDurations[SPELLS.LIGHT_STAGGER_DEBUFF.id];
  }

  get moderateDuration() {
    return this.staggerDurations[SPELLS.MODERATE_STAGGER_DEBUFF.id];
  }

  get heavyDuration() {
    return this.staggerDurations[SPELLS.HEAVY_STAGGER_DEBUFF.id];
  }

  get noneDuration() {
    return this.owner.fightDuration - this.lightDuration - this.moderateDuration - this.heavyDuration;
  }

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HIGH_TOLERANCE_TALENT.id);
  }

  on_toPlayer_applydebuff(event) {
    if(!(event.ability.guid in HIGH_TOLERANCE_HASTE)) {
      return;
    }
    this._lastDebuffApplied = event.timestamp;
    this._staggerLevel = event.ability.guid;
  }

  on_toPlayer_removedebuff(event) {
    if(!(event.ability.guid in HIGH_TOLERANCE_HASTE)) {
      return;
    }
    this.staggerDurations[event.ability.guid] += event.timestamp - this._lastDebuffApplied;
    this._staggerLevel = null;
  }

  on_finished() {
    if(this._staggerLevel !== null) {
      this.staggerDurations[this._staggerLevel] += this.owner.currentTimestamp - this._lastDebuffApplied;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HIGH_TOLERANCE_TALENT.id} />}
        value={`${formatPercentage(this.meanHaste)}%`}
        label="Avg. Haste from High Tolerance"
        tooltip={`You spent: <ul>
              <li><b>${formatThousands(this.noneDuration / 1000)}s</b> (${formatPercentage(this.noneDuration / this.owner.fightDuration)}%) without Stagger.</li>
              <li><b>${formatThousands(this.lightDuration / 1000)}s</b> (${formatPercentage(this.lightDuration / this.owner.fightDuration)}%) in Light Stagger.</li>
              <li><b>${formatThousands(this.moderateDuration / 1000)}s</b> (${formatPercentage(this.moderateDuration / this.owner.fightDuration)}%) in Moderate Stagger.</li>
              <li><b>${formatThousands(this.heavyDuration / 1000)}s</b> (${formatPercentage(this.heavyDuration / this.owner.fightDuration)}%) in Heavy Stagger.</li>
            </ul>`}
          />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default HighTolerance;
