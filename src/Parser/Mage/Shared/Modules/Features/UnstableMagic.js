import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';

// Unstable Magic cleaves don't always hit on identical timestamps, so we're giving a 100ms buffer
const PROC_WINDOW_MS = 100;

const PROCCERS = [
  SPELLS.FROSTBOLT_DAMAGE.id,
  SPELLS.FIREBALL.id,
  SPELLS.ARCANE_BLAST.id,
];

const PROCS = [
  SPELLS.UNSTABLE_MAGIC_DAMAGE_FIRE.id,
  SPELLS.UNSTABLE_MAGIC_DAMAGE_FROST.id,
  SPELLS.UNSTABLE_MAGIC_DAMAGE_ARCANE.id,
];

class UnstableMagic extends Analyzer {
  static dependencies = {
    combatants: Combatants,
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
    if(PROCS.includes(event.ability.guid)) {
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
        tooltip={`This is the portion of your total damage attributable to Unstable Magic.
          <ul>
          <li>Targets Hit per Proc: <b>${averageHits.toFixed(2)}</b> (including primary target)</li>
          <li>Proc Rate: <b>${formatPercentage(procRate)}%</b></li>
          </ul>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default UnstableMagic;
