import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import { formatDuration, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

// time before and after shield proc to show user
const PROC_EVENT_START_BUFFER = 5000;
const PROC_EVENT_END_BUFFER = 1000;

const HOT_DURATION = 120000;

// percentage of total duration for suggestion
const MINOR = 0.80;
const AVERAGE = 0.60;
const MAJOR = 0.30;

/*
 * The Deceiver's Grand Design -
 * Use: Mark a friendly player with Guiding Hand, healing them for 79,760 every 3.0 sec for 2 min. If they fall below 35% health, Guiding Hand is consumed to grant them a shield that prevents 1,395,816 damage for 15 sec. (2 min recharge, 2 charges) (1.5 sec cooldown)
 */
class DecieversGrandDesign extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healingHot = 0;
  healingAbsorb = 0;

  casts = [];

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.DECEIVERS_GRAND_DESIGN.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.GUIDING_HAND.id) {
      this.healingHot += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.FRUITFUL_MACHINATIONS.id) {
      this.healingAbsorb += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.GUIDING_HAND.id) {
      debug && console.log("Guiding Hand applied to " + event.targetID +" @ " + this.owner.formatTimestamp(event.timestamp));

      const target = event.targetID;
      let targetName = '';
      if (!this.combatants.players[target]) {
        targetName = 'Pet';
      } else {
        targetName = this.combatants.players[target].name;
      }
      this.casts.push({
        target,
        targetName,
        applied: event.timestamp,
        active: true,
        shieldProc: false,
      });

    } else if (spellId === SPELLS.FRUITFUL_MACHINATIONS.id) {
      debug && console.log("Fruitful Machinations proc on " + event.targetID +" @ " + this.owner.formatTimestamp(event.timestamp));
      const lastCastOnTarget = this.casts.filter(cast => cast.target === event.targetID).pop();
      if (!lastCastOnTarget) {
        console.warn("No Guiding Hand application logged for targetID " + event.targetID);
        return;
      }
      lastCastOnTarget.shieldProc = true;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.GUIDING_HAND.id) {
      return;
    }

    debug && console.log("Guiding Hand removed from " + event.targetID +" @ " + this.owner.formatTimestamp(event.timestamp));
    const cast = this.casts.find(cast => cast.active && cast.target === event.targetID);
    cast.active = false;
    cast.removed = event.timestamp;
    cast.duration = cast.removed - cast.applied;
  }

  get totalHealing() {
    return this.healingHot + this.healingAbsorb;
  }

  get averageDuration() { // average doesn't include HoTs still active on fight end, null if there are no completed HoTs
    const totalDuration = this.casts.filter(cast => !cast.active).reduce((acc, cast) => acc + cast.duration, 0);
    const totalCompleted = this.casts.filter(cast => !cast.active).length;
    return !totalCompleted ? null : totalDuration / totalCompleted;
  }

  item() {
    const avgDurationDisplay = !this.averageDuration ? `N/A` : `${(this.averageDuration / 1000).toFixed(0)}s`;
    return {
      item: ITEMS.DECEIVERS_GRAND_DESIGN,
      result: (
        <dfn data-tip={`Healing breakdown:
        <ul>
          <li>HoT: <b>${this.owner.formatItemHealingDone(this.healingHot)}</b></li>
          <li>Shield Proc: <b>${this.owner.formatItemHealingDone(this.healingAbsorb)}</b></li>
        </ul>
        Casts: <b>${this.casts.length}</b><br>
        Average Duration: <b>${avgDurationDisplay}</b><br>
        Cast Detail:
        <ul>
          ${this.casts.reduce((arr, cast) => {
            let castResult = ` -> `;
            if (!cast.active) {
              if (cast.shieldProc) {
                castResult += `procced after ${(cast.duration / 1000).toFixed(0)}s`;
              } else {
                castResult += `expired naturally`;
              }
            } else {
              castResult += `fight ended`;
            }
            return arr + `<li>on ${cast.targetName} @${this.owner.formatTimestamp(cast.applied)}${castResult}</li>`
          }, '')}
        </ul>
        `}>
          {this.owner.formatItemHealingDone(this.totalHealing)}
        </dfn>
      ),
    };
  }

  suggestions(when) {
    const report = this.owner.report.code;
    const fight = this.owner.fight.id;
    const averagePercent = this.averageDuration / HOT_DURATION;
    when(averagePercent).isLessThan(MINOR)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <Wrapper>
            Your <ItemLink id={ITEMS.DECEIVERS_GRAND_DESIGN.id} /> was proccing early. Try to cast it on players without spiky health pools. The following events procced the shield:<br />
            {this.casts.map((cast, index) => {
              if (!cast.shieldProc) {
                return;
              }
              const reportWindowStart = cast.removed - PROC_EVENT_START_BUFFER;
              const reportWindowEnd = cast.removed + PROC_EVENT_END_BUFFER;
              const url = `https://www.warcraftlogs.com/reports/${report}/#fight=${fight}&source=${cast.target}&type=summary&start=${reportWindowStart}&end=${reportWindowEnd}&view=events`;
              return (
                <div key={index}>
                  Cast {index + 1} procced on <a href={url} target="_blank" rel="noopener noreferrer">{cast.targetName} @ {this.owner.formatTimestamp(cast.removed)}</a> after {(cast.duration / 1000).toFixed(0)}s
                </div>
              );
            })}
          </Wrapper>
        )
        .icon(ITEMS.DECEIVERS_GRAND_DESIGN.icon)
        .actual(`HoT averaged ${formatPercentage(averagePercent, 0)}% of max duration.`)
        .recommended(`${formatPercentage(recommended, 0)}% is recommended`)
        .regular(AVERAGE).major(MAJOR);
      });
  }
}

export default DecieversGrandDesign;
