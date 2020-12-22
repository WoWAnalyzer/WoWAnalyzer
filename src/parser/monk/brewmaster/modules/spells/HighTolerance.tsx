import React from 'react';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import HasteIcon from 'interface/icons/Haste';
import BoringValue from 'interface/statistics/components/BoringValueText';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, RemoveDebuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import Combatant from 'parser/core/Combatant';

export const HIGH_TOLERANCE_HASTE: Record<number,number> = {
  [SPELLS.LIGHT_STAGGER_DEBUFF.id]: 0.08,
  [SPELLS.MODERATE_STAGGER_DEBUFF.id]: 0.12,
  [SPELLS.HEAVY_STAGGER_DEBUFF.id]: 0.15,
};

function hasHighTolerance(combatant: Combatant) {
  return combatant.hasTalent(SPELLS.HIGH_TOLERANCE_TALENT.id);
}

function hasteFnGenerator(value: number) {
  return { haste: (combatant: Combatant) => hasHighTolerance(combatant) ? value : 0.0 };
}

export const HIGH_TOLERANCE_HASTE_FNS = {
  [SPELLS.LIGHT_STAGGER_DEBUFF.id]: hasteFnGenerator(0.08),
  [SPELLS.MODERATE_STAGGER_DEBUFF.id]: hasteFnGenerator(0.12),
  [SPELLS.HEAVY_STAGGER_DEBUFF.id]: hasteFnGenerator(0.15),
};

class HighTolerance extends Analyzer {
  get meanHaste() {
    return Object.keys(HIGH_TOLERANCE_HASTE)
      .map(key => this.staggerDurations[Number(key)] * HIGH_TOLERANCE_HASTE[Number(key)])
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

  staggerDurations: Record<number, number> = {
    [SPELLS.LIGHT_STAGGER_DEBUFF.id]: 0,
    [SPELLS.MODERATE_STAGGER_DEBUFF.id]: 0,
    [SPELLS.HEAVY_STAGGER_DEBUFF.id]: 0,
  };
  _staggerLevel: number | null = null;
  _lastDebuffApplied = 0;

  constructor(args: Options) {
    super(args);
    this.active = hasHighTolerance(this.selectedCombatant);
    this.addEventListener(Events.applydebuff.to(SELECTED_PLAYER), this.onApplyDebuff);
    this.addEventListener(Events.removedebuff.to(SELECTED_PLAYER), this.onRemoveDebuff);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    if (!HIGH_TOLERANCE_HASTE[event.ability.guid]) {
      return;
    }
    this._lastDebuffApplied = event.timestamp;
    this._staggerLevel = event.ability.guid;
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
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
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
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
      >
        <BoringValue label={<><SpellIcon id={SPELLS.HIGH_TOLERANCE_TALENT.id} /> Avg. Haste from High Tolerance</>}>
          <>
            <HasteIcon /> {formatPercentage(this.meanHaste)} %
          </>
        </BoringValue>
      </Statistic>
    );
  }
}

export default HighTolerance;
