import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatMilliseconds, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

const debug = false;

const PROC_WINDOW_MS = 100;

const HOT_STREAK_CONTRIBUTORS = [
  SPELLS.FIREBALL.id,
  SPELLS.PYROBLAST.id,
  SPELLS.FIRE_BLAST.id,
  SPELLS.SCORCH.id,
];

class HotStreak extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  totalProcs = 0;
  wastedCrits = 0;
  expiredProcs = 0;
  pyroWithoutProc = 0;
  lastCastTimestamp = 0;
  phoenixFlamesHits = 0;
  dragonsBreathHits = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROBLAST.id && spellId !== SPELLS.FLAMESTRIKE.id) {
      return;
    }
    this.lastCastTimestamp = this.owner.currentTimestamp;
    if (spellId === SPELLS.PHOENIXS_FLAMES.id) {
      this.phoenixFlamesHits = 0;
    }
    if (spellId === SPELLS.DRAGONS_BREATH.id) {
      this.dragonsBreathHits = 0;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if ((!HOT_STREAK_CONTRIBUTORS.includes(spellId) && spellId !== SPELLS.PHOENIXS_FLAMES.id && spellId !== SPELLS.DRAGONS_BREATH.id) || event.hitType !== HIT_TYPES.CRIT || !this.combatants.selected.hasBuff(SPELLS.HOT_STREAK.id)) {
      return;
    }
    //If a direct damage ability crits while the player already has Hot Streak then a proc was overwritten
    if (HOT_STREAK_CONTRIBUTORS.includes(spellId) && event.hitType === HIT_TYPES.CRIT) {
      this.wastedCrits += 1;
      if (debug) {
        console.log("Hot Streak overwritten @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      }
    }
    //If the spell was Phoenix Flames, only check the first hit of Phoenix Flames and not the chains/splashes
    if (spellId === SPELLS.PHOENIXS_FLAMES.id) {
      if (this.phoenixFlamesHits === 0) {
        this.wastedCrits += 1;
        this.phoenixsFlamesHits += 1;
        if (debug) {
          console.log("Hot Streak overwritten @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
        }
      } else {
        this.phoenixsFlamesHits += 1;
      }
    }
    //If the spell was Dragon's Breath, only count the first hit and only if the player has Alexstrasza's Fury.
    if (spellId === SPELLS.DRAGONS_BREATH.id && this.combatants.selected.hasTalent(SPELLS.ALEXSTRASZAS_FURY_TALENT.id)) {
      if (this.dragonsBreathHits === 0) {
        this.wastedCrits += 1;
        this.dragonsBreathHits += 1;
        if (debug) {
          console.log("Hot Streak overwritten @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
        }
      } else {
        this.dragonsBreathHits += 1;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOT_STREAK.id) {
      return;
    }
    this.totalProcs += 1;
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOT_STREAK.id) {
      return;
    }
    if (!this.lastCastTimestamp || this.lastCastTimestamp + PROC_WINDOW_MS < this.owner.currentTimestamp) {
      this.expiredProcs += 1;
      if (debug) {
        console.log("Hot Streak proc expired @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      }
    }
  }

  get usedProcs() {
    return this.totalProcs - this.expiredProcs;
  }

  suggestions(when) {
    const expiredProcsPercent = (this.expiredProcs / this.totalProcs) || 0;
    when(expiredProcsPercent).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You allowed {formatPercentage(expiredProcsPercent)}% of your <SpellLink id={SPELLS.HOT_STREAK.id} /> procs to expire. Try to use your procs as soon as possible to avoid this.</span>)
          .icon(SPELLS.HOT_STREAK.icon)
          .actual(`${formatPercentage(expiredProcsPercent)}% expired`)
          .recommended(`Letting none expire is recommended`)
          .regular(.00).major(.05);
      });
  }

  statistic() {
    const hotStreakUtil = (1 - (this.expiredProcs / this.totalProcs)) || 0;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HOT_STREAK.id} />}
        value={`${formatPercentage(hotStreakUtil, 0)} %`}
        label="Hot Streak Utilization"
        tooltip={`You got ${this.totalProcs} total procs.
					<ul>
						<li>${this.usedProcs} used</li>
						<li>${this.expiredProcs} expired</li>
					</ul>
				`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(12);
}

export default HotStreak;
