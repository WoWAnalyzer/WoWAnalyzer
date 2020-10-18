import React from 'react';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

export const HIGH_TOLERANCE_HASTE = {
  [SPELLS.LIGHT_STAGGER_DEBUFF.id]: 0.08,
  [SPELLS.MODERATE_STAGGER_DEBUFF.id]: 0.12,
  [SPELLS.HEAVY_STAGGER_DEBUFF.id]: 0.15,
};

function hasHighTolerance(combatant) {
  return combatant.hasTalent(SPELLS.HIGH_TOLERANCE_TALENT.id);
}

function hasteFnGenerator(value) {
  return { haste: combatant => hasHighTolerance(combatant) ? value : 0.0 };
}

export const HIGH_TOLERANCE_HASTE_FNS = {
  [SPELLS.LIGHT_STAGGER_DEBUFF.id]: hasteFnGenerator(0.08),
  [SPELLS.MODERATE_STAGGER_DEBUFF.id]: hasteFnGenerator(0.12),
  [SPELLS.HEAVY_STAGGER_DEBUFF.id]: hasteFnGenerator(0.15),
};

class HighTolerance extends Analyzer {
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

  constructor(...args) {
    super(...args);
    this.active = hasHighTolerance(this.selectedCombatant);
    this.addEventListener(Events.applydebuff.to(SELECTED_PLAYER), this.onApplyDebuff);
    this.addEventListener(Events.removedebuff.to(SELECTED_PLAYER), this.onRemoveDebuff);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  onApplyDebuff(event) {
    if (!HIGH_TOLERANCE_HASTE[event.ability.guid]) {
      return;
    }
    this._lastDebuffApplied = event.timestamp;
    this._staggerLevel = event.ability.guid;
  }

  onRemoveDebuff(event) {
    if (!HIGH_TOLERANCE_HASTE[event.ability.guid]) {
      return;
    }
    this.staggerDurations[event.ability.guid] += event.timestamp - this._lastDebuffApplied;
    this._staggerLevel = null;
  }

  onFightend() {
    if (this._staggerLevel !== null) {
      this.staggerDurations[this._staggerLevel] += this.owner.fight.end_time - this._lastDebuffApplied;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HIGH_TOLERANCE_TALENT.id} />}
        value={`${formatPercentage(this.meanHaste)}%`}
        label="Avg. Haste from High Tolerance"
        tooltip={(
          <>
            You spent:
            <ul>
              <li><strong>{formatThousands(this.noneDuration / 1000)}s</strong> ({formatPercentage(this.noneDuration / this.owner.fightDuration)}%) without Stagger.</li>
              <li><strong>{formatThousands(this.lightDuration / 1000)}s</strong> ({formatPercentage(this.lightDuration / this.owner.fightDuration)}%) in Light Stagger.</li>
              <li><strong>{formatThousands(this.moderateDuration / 1000)}s</strong> ({formatPercentage(this.moderateDuration / this.owner.fightDuration)}%) in Moderate Stagger.</li>
              <li><strong>{formatThousands(this.heavyDuration / 1000)}s</strong> ({formatPercentage(this.heavyDuration / this.owner.fightDuration)}%) in Heavy Stagger.</li>
            </ul>
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default HighTolerance;
