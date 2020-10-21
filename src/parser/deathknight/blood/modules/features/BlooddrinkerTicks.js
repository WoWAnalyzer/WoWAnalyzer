import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatThousands } from 'common/format';
import Events from 'parser/core/Events';

const BLOODDRINKER_TICKS_PER_CAST = 4;

class Blooddrinker extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  _totalTicks = 0;
  _totalCasts = 0;
  _currentTicks = 0;
  _wastedTicks = 0;
  _ruinedCasts = 0;
  totalDamage = 0;
  totalHealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLOODDRINKER_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLOODDRINKER_TALENT), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLOODDRINKER_TALENT), this.onDamage);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER).spell(SPELLS.BLOODDRINKER_TALENT), this.onHeal);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.BLOODDRINKER_TALENT), this.onRemoveDebuff);
  }

  onCast(event) {
    this._totalCasts += 1;
  }

  onDamage(event) {
    this.totalDamage += event.amount + (event.absorbed || 0);
    this._currentTicks += 1;
  }

  onHeal(event) {
    this.totalHealing+= (event.amount || 0) + (event.absorbed || 0);
  }

  onRemoveDebuff(event) {
    if (this._currentTicks < BLOODDRINKER_TICKS_PER_CAST) {
      this._wastedTicks += (BLOODDRINKER_TICKS_PER_CAST - this._currentTicks);
      this._ruinedCasts += 1;
    }
    this._currentTicks = 0;
  }

  statistic() {
    this._totalTicks = this._totalCasts * BLOODDRINKER_TICKS_PER_CAST;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BLOODDRINKER_TALENT.id} />}
        value={`${this._ruinedCasts} out of ${this._totalCasts}`}
        label="Channels cancelled early"
        tooltip={(
          <>
            You lost <strong>{this._wastedTicks}</strong> out of <strong>{this._totalTicks}</strong> ticks.<br />
            <strong>Damage:</strong> {formatThousands(this.totalDamage)} / {this.owner.formatItemDamageDone(this.totalDamage)}<br />
            <strong>Healing:</strong> {formatThousands(this.totalHealing)} / {this.owner.formatItemHealingDone(this.totalHealing)}<br />
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default Blooddrinker;
