import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Module from 'Parser/Core/Module';

// Unstable Magic cleaves don't always hit on identical timestamps, so we're giving a 100ms buffer
const PROC_WINDOW_MS = 100;

const PROCCERS = [
  SPELLS.FROSTBOLT_DAMAGE.id,
  SPELLS.FIREBALL.id,
  SPELLS.ARCANE_BLAST.id,
];

class UnstableMagic extends Module {

  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
	}

  proccerHits = 0;
  damage = 0;
  hits = 0;
  procs = 0;
  hitTimestamp;

  on_initialized() {
	   this.active = this.combatants.selected.hasTalent(SPELLS.UNSTABLE_MAGIC_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if(event.ability.guid === SPELLS.UNSTABLE_MAGIC_DAMAGE.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.hits += 1;
      if(!this.hitTimestamp || this.hitTimestamp + PROC_WINDOW_MS < this.owner.currentTimestamp) {
        this.hitTimestamp = this.owner.currentTimestamp;
        this.procs += 1;
      }
    } else if(PROCCERS.includes(event.ability.guid)) {
      this.proccerHits += 1;
    }
  }

  statistic() {
    const damagePercent = this.owner.getPercentageOfTotalDamageDone(this.damage);
    const averageHits = (this.hits / this.procs) || 0;
    const procRate = (this.procs / this.proccerHits) || 0;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.UNSTABLE_MAGIC_TALENT.id} />}
        value={`${formatPercentage(damagePercent)} %`}
        label="Unstable Magic damage"
        tooltip={`This is the portion of your total damage attributable to Unstable Magic. Your proc's cleave hit an average of <b>${averageHits.toFixed(2)}</b> targets, and your effective proc rate was <b>${formatPercentage(procRate)}%</b>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default UnstableMagic;
