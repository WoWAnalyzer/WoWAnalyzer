import React from 'react';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage, formatThousands } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

export const HIGH_TOLERANCE_HASTE = {
  [SPELLS.LIGHT_STAGGER_DEBUFF.id]: 0.08,
  [SPELLS.MODERATE_STAGGER_DEBUFF.id]: 0.12,
  [SPELLS.HEAVY_STAGGER_DEBUFF.id]: 0.15,
};

function hasHighTolerance(combatant) {
  return combatant.hasTalent(SPELLS.HIGH_TOLERANCE_TALENT.id) || combatant.hasFinger(ITEMS.SOUL_OF_THE_GRANDMASTER.id);
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
  }

  on_toPlayer_applydebuff(event) {
    if (!HIGH_TOLERANCE_HASTE[event.ability.guid]) {
      return;
    }
    this._lastDebuffApplied = event.timestamp;
    this._staggerLevel = event.ability.guid;
  }

  on_toPlayer_removedebuff(event) {
    if (!HIGH_TOLERANCE_HASTE[event.ability.guid]) {
      return;
    }
    this.staggerDurations[event.ability.guid] += event.timestamp - this._lastDebuffApplied;
    this._staggerLevel = null;
  }

  on_finished() {
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
