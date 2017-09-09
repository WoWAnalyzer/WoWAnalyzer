import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;
const PROC_EVENT_START_BUFFER = 5000;
const PROC_EVENT_END_BUFFER = 1000;

class DecieversGrandDesign extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;
  healingAbsorb = 0;
  targetOne = null;
  downTimeTargetOne = 0;
  procTimestampTargetOne = null;
  downTimeTargetTwo = 0;
  targetTwo = null;
  procTimestampTargetTwo = null;
  proced = false;

  procs = [];

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.DECEIVERS_GRAND_DESIGN.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.GUIDING_HAND.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);

      // Account for precasting
      if (this.targetOne === event.targetID || this.targetTwo === event.targetID) {
        return;
      } else {
        if (!this.targetOne) {
          this.targetOne = event.targetID;
        } else {
          this.targetTwo = event.targetID;
        }
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
        debug && console.log('Target One: ' + this.targetOne);
      } else if (this.targetTwo === null) {
        this.targetTwo = event.targetID;
        debug && console.log('Target Two: ' + this.targetTwo);
      } else {
        debug && console.log('Logic Error?!');
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    if (spellId === SPELLS.FRUITFUL_MACHINATIONS.id) {
      this.proced = true;
      const startTime = event.timestamp - PROC_EVENT_START_BUFFER;
      const endTime = event.timestamp + PROC_EVENT_END_BUFFER;
      if (targetId === this.targetOne) {
        this.targetOne = null;
        this.procTimestampTargetOne = event.timestamp;
        debug && console.log('Proc on Target one:', targetId, ' @ timestamp: ', event.timestamp);
      } else if (targetId === this.targetTwo) {
        this.targetTwo = null;
        this.procTimestampTargetTwo = event.timestamp;
        debug && console.log('Proc on Target two:', targetId, ' @ timestamp: ', event.timestamp);
      }
      if (debug) {
        this.procs.push({
          name: 'Test User',
          report: this.owner.report.code,
          fight: this.owner.fight.id,
          target: targetId,
          start: startTime,
          end: endTime,
        });
      }

      let name = "";
      if (!this.combatants.players[targetId]) {
        name = "Pet";
      } else {
        name = this.combatants.players[targetId].name;
      }

      this.procs.push({
        name: name,
        report: this.owner.report.code,
        fight: this.owner.fight.id,
        target: targetId,
        start: startTime,
        end: endTime,
      });
      debug && console.log(this.procs);
      debug && console.log('https://www.warcraftlogs.com/reports/' + this.owner.report.code + '/#fight=' + this.owner.fight.id + '&source=' + this.procs[0].target + '&type=summary&start=' + this.procs[0].start + '&end=' + this.procs[0].end + '&view=events');
    }
  }

  on_finished() {
    if (debug) {
      console.log('Proc Checks: ', this.procs);
      console.log('Healing: ' + this.healing);
      console.log('Absorbed: ' + this.healingAbsorb);
      console.log('Report Code: ' + this.owner.report.code);
    }
  }

  item() {
    const deceiversGrandDesignHealingPercentage = this.owner.getPercentageOfTotalHealingDone(this.healing);
    const deceiversGrandDesignAbsorbPercentage = this.owner.getPercentageOfTotalHealingDone(this.healingAbsorb);
    const deceiversGrandDesignTotalPercentage = this.owner.getPercentageOfTotalHealingDone(this.healing + this.healingAbsorb);
    return {
      item: ITEMS.DECEIVERS_GRAND_DESIGN,
      result: (
        <dfn data-tip={`The effective healing contributed by the Deciever's Grand Design on-use effect.<br />
            HOT: ${((deceiversGrandDesignHealingPercentage * 100) || 0).toFixed(2)} % / ${formatNumber(this.healing / this.owner.fightDuration * 1000)} HPS<br />
            Shield Proc: ${((deceiversGrandDesignAbsorbPercentage * 100) || 0).toFixed(2)} % / ${formatNumber(this.healingAbsorb / this.owner.fightDuration * 1000)} HPS`}>
          {((deceiversGrandDesignTotalPercentage * 100) || 0).toFixed(2)} % / {formatNumber((this.healing + this.healingAbsorb) / this.owner.fightDuration * 1000)} HPS
        </dfn>
      ),
    };
  }
  suggestions(when) {
    when(this.proced).isTrue()
      .addSuggestion(suggest => {
        return suggest(
          <span>
              Your <ItemLink id={ITEMS.DECEIVERS_GRAND_DESIGN.id} /> procced earlier than expected. Try to cast it on players without spiky health pools. The following events procced the effect:<br />
            {this.procs
              .map((procs, index) => {
                const url = `https://www.warcraftlogs.com/reports/${procs.report}/#fight=${procs.fight}&source=${procs.target}&type=summary&start=${procs.start}&end=${procs.end}&view=events`;
                return (
                  <div key={index}>
                    Proc {index + 1} on: <a href={url} target="_blank" rel="noopener noreferrer">{procs.name}</a>
                  </div>
                );
              })}
            </span>
        )
          .icon(ITEMS.DECEIVERS_GRAND_DESIGN.icon);
      });
  }
}

export default DecieversGrandDesign;
