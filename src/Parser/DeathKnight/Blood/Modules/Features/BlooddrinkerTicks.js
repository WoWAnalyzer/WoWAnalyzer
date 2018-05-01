import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellIcon from 'common/SpellIcon';
import { formatThousands } from 'common/format';

const BLOODDRINKER_TICKS_PER_CAST = 4;

class Blooddrinker extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  _totalTicks = 0;
  _totalCasts = 0;
  _currentTicks = 0;
  _wastedTicks = 0;
  _ruinedCasts = 0;
  totalDamage = 0;
  totalHealing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.BLOODDRINKER_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.BLOODDRINKER_TALENT.id) {
      return;
    }
      this._totalCasts += 1;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.BLOODDRINKER_TALENT.id) {
      return;
    }
      this.totalDamage += event.amount + (event.absorbed || 0);
      this._currentTicks += 1;
  }
  on_toPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.BLOODDRINKER_TALENT.id) {
      return;
    }
    this.totalHealing+= (event.amount || 0) + (event.absorbed || 0);
  }

  on_byPlayer_removedebuff(event) {
    if (event.ability.guid !== SPELLS.BLOODDRINKER_TALENT.id) {
      return;
    }
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
        label="Channels cancelled Early"
        tooltip={`You lost <strong>${this._wastedTicks}</strong> out of <strong>${this._totalTicks}</strong> ticks.<br>
        <strong>Damage:</strong> ${formatThousands(this.totalDamage)} / ${this.owner.formatItemDamageDone(this.totalDamage)}<br>
        <strong>Healing:</strong> ${formatThousands(this.totalHealing)} / ${this.owner.formatItemHealingDone(this.totalHealing)}<br>`}


      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Blooddrinker;
