import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';

// Frost Bomb cleaves don't always hit on identical timestamps, so we're giving a 100ms buffer
const PROC_WINDOW_MS = 100;

class FrostBomb extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  damage = 0;
  hits = 0;
  procs = 0;
  hitTimestamp;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FROST_BOMB_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.FROST_BOMB_DAMAGE.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.hits += 1;
      if (!this.hitTimestamp || this.hitTimestamp + PROC_WINDOW_MS < this.owner.currentTimestamp) {
        this.hitTimestamp = this.owner.currentTimestamp;
        this.procs += 1;
      }
    }
  }

  statistic() {
    const damagePercent = this.owner.getPercentageOfTotalDamageDone(this.damage);
    const averageHits = (this.hits / this.procs) || 0;
    const casts = (this.abilityTracker.getAbility(SPELLS.FROST_BOMB_TALENT.id).casts || 0);
    const averageProcs = (this.procs / casts) || 0;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FROST_BOMB_TALENT.id} />}
        value={`${formatPercentage(damagePercent)} %`}
        label="Frost Bomb damage"
        tooltip={`This is the portion of your total damage attributable to Frost Bomb.
          <ul>
          <li>Procs per Cast: <b>${averageProcs.toFixed(2)}</b></li>
          <li>Targets Hit per Proc: <b>${averageHits.toFixed(2)}</b> (including primary target)</li>
          </ul>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(10);
}

export default FrostBomb;
