import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import { formatDuration } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;
// time before and after shield proc to show user
const PROC_EVENT_START_BUFFER = 5000;
const PROC_EVENT_END_BUFFER = 1000;

const HOT_DURATION = 120000;

class DecieversGrandDesign extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healingHot = 0;
  healingAbsorb = 0;

  targetOne = null;
  targetOneCastTimestamp = null;

  targetTwo = null;
  targetTwoCastTimestamp = null;

  procs = [];

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.DECEIVERS_GRAND_DESIGN.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.GUIDING_HAND.id) {
      this.healingHot += (event.amount || 0) + (event.absorbed || 0);

      // Account for precasting
      if (this.targetOne === event.targetID || this.targetTwo === event.targetID) {

      } else if (!this.targetOne) {
        this.targetOne = event.targetID;
      } else {
        this.targetTwo = event.targetID;
      }
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.FRUITFUL_MACHINATIONS.id) {
      this.healingAbsorb += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.GUIDING_HAND.id) {
      if (this.targetOne === null) {
        this.targetOne = event.targetID;
        this.targetOneCastTimestamp = event.timestamp;
        debug && console.log(`Target One: ${this.targetOne}`);
      } else if (this.targetTwo === null) {
        this.targetTwo = event.targetID;
        this.targetTwoCastTimestamp = event.timestamp;
        debug && console.log(`Target Two: ${this.targetTwo}`);
      } else {
        debug && console.log('Logic Error?!');
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FRUITFUL_MACHINATIONS.id) {
      return;
    }

    const targetId = event.targetID;
    const startTime = event.timestamp - PROC_EVENT_START_BUFFER;
    const endTime = event.timestamp + PROC_EVENT_END_BUFFER;
    const timeSinceStart = event.timestamp - this.owner.fight.start_time;
    let timeSinceCast;
    if (targetId === this.targetOne) {
      this.targetOne = null;
      timeSinceCast = event.timestamp - this.targetOneCastTimestamp;
      debug && console.log('Proc on Target one:', targetId, ' @ timestamp: ', event.timestamp);
    } else if (targetId === this.targetTwo) {
      this.targetTwo = null;
      timeSinceCast = event.timestamp - this.targetTwoCastTimestamp;
      debug && console.log('Proc on Target two:', targetId, ' @ timestamp: ', event.timestamp);
    }

    if (debug) {
      this.procs.push({
        name: 'Test User',
        report: this.owner.report.code,
        fight: this.owner.fight.id,
        target: targetId,
        timeSinceStart,
        timeSinceCast,
        start: startTime,
        end: endTime,
      });
    }

    // store info about shield procs for later display
    let name = '';
    if (!this.combatants.players[targetId]) {
      name = 'Pet';
    } else {
      name = this.combatants.players[targetId].name;
    }

    this.procs.push({
      name,
      report: this.owner.report.code,
      fight: this.owner.fight.id,
      target: targetId,
      timeSinceStart,
      timeSinceCast,
      start: startTime,
      end: endTime,
    });
    debug && console.log(this.procs);
    debug && console.log(`https://www.warcraftlogs.com/reports/${this.owner.report.code}/#fight=${this.owner.fight.id}&source=${this.procs[0].target}&type=summary&start=${this.procs[0].start}&end=${this.procs[0].end}&view=events`);
  }

  on_finished() {
    if (debug) {
      console.log('Proc Checks: ', this.procs);
      console.log(`Healing HoT: ${this.healingHot}`);
      console.log(`Absorbed: ${this.healingAbsorb}`);
      console.log(`Report Code: ${this.owner.report.code}`);
    }
  }

  get totalHealing() {
    return this.healingHot + this.healingAbsorb;
  }

  item() {
    return {
      item: ITEMS.DECEIVERS_GRAND_DESIGN,
      result: (
        <dfn data-tip={`Healing breakdown:
          <ul>
            <li>HoT: <b>${this.owner.formatItemHealingDone(this.healingHot)}</b></li>
            <li>Shield Proc: <b>${this.owner.formatItemHealingDone(this.healingAbsorb)}</b></li>
          </ul>
        `}>
          {this.owner.formatItemHealingDone(this.totalHealing)}
        </dfn>
      ),
    };
  }

  suggestions(when) {
    when(this.procs.length).isGreaterThan(0)
      .addSuggestion((suggest) => {
        return suggest(
          <Wrapper>
            Your <ItemLink id={ITEMS.DECEIVERS_GRAND_DESIGN.id} /> procced earlier than expected. Try to cast it on players without spiky health pools. The following events procced the effect:<br />
            {this.procs.map((proc, index) => {
              const url = `https://www.warcraftlogs.com/reports/${proc.report}/#fight=${proc.fight}&source=${proc.target}&type=summary&start=${proc.start}&end=${proc.end}&view=events`;
              const secondsLeftOnHot = ((HOT_DURATION - proc.timeSinceCast) / 1000).toFixed(0);
              return (
                <div key={index}>
                  Proc {index + 1}: <a href={url} target="_blank" rel="noopener noreferrer">{proc.name} @{formatDuration(proc.timeSinceStart / 1000)} with {secondsLeftOnHot}s remaining on HoT</a>
                </div>
              );
            })}
          </Wrapper>
        )
        .icon(ITEMS.DECEIVERS_GRAND_DESIGN.icon)
        .regular(2).major(4);
      });
  }
}

export default DecieversGrandDesign;
