import React from 'react';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import { formatNumber } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import HotTracker from '../Core/HotTracker';

const debug = false;

const RISING_MIST_EXTENSION = 2000;

class RisingMist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTracker,
  };

  risingMistCount = 0;
  risingMists = [];

  efsExtended = 0; // tracks how many flourishes extended Wild Growth

  remCount = 0;
  efCount = 0;
  evmCount = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.RISING_MIST.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.RISING_SUN_KICK.id !== spellId) {
      return;
    }

    this.risingMistCount += 1;
    debug && console.log(`risingMist cast #: ${this.risingMistCount}`);

    const newRisingMist = {
      name: `risingMist #${this.risingMistCount}`,
      healing: 0,
      procs: 0,
      duration: 0,
    };
    this.risingMists.push(newRisingMist);

    let foundEf = false;

    Object.keys(this.hotTracker.hots).forEach(playerId => {
      Object.keys(this.hotTracker.hots[playerId]).forEach(spellIdString => {
        const spellId = Number(spellIdString);

        const attribution = newRisingMist;
        this.hotTracker.addExtension(attribution, RISING_MIST_EXTENSION, playerId, spellId);

        if (spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
          foundEf = true;
          this.wgCount += 1;
        } else if (spellId === SPELLS.RENEWING_MIST_HEAL.id) {
          this.remCount += 1;
        } else if (spellId === SPELLS.ENVELOPING_MISTS.id) {
          this.evmCount += 1;
        }
      });
    });

    if (foundEf) {
      this.efsExtended += 1;
    }
  }

  get totalHealing() {
    return this.risingMists.reduce((acc, risingMist) => acc + risingMist.healing, 0);
  }

  get averageHealing() {
    return this.risingMistCount === 0 ? 0 : this.totalHealing / this.risingMistCount;
  }

  statistic() {
    return(
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.RISING_MIST.id} />}
        value={`${formatNumber(this.averageHealing)}`}
        label="Average Healing"
        tooltip={
          `Your ${this.risingMistCount} Rising Sun Kick casts extended:
          <ul>
            <li>${this.efsExtended}/${this.risingMistCount} Essence Font casts (${this.efCount} HoTs)</li>
            ${this.remCount > 0
              ? `<li>${this.remCount} Renewing Mist</li>`
              : ``
            }
            ${this.evmCount > 0
              ? `<li>${this.evmCount} Enveloping Mist</li>`
              : ``
            }
          </ul>
          <br>
          The Healing column shows how much additional healing was done by the 2 extra seconds of HoT time. Note that if you Rising Sun Kicked near the end of a fight, numbers might be lower than you expect because extension healing isn't tallied until a HoT falls.`
        }
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast</th>
              <th># of HoTs</th>
              <th>Healing</th>
            </tr>
          </thead>
          <tbody>
            {
              this.risingMists.map((risingMist, index) => (
                <tr key={index}>
                  <th scope="row">{ index + 1 }</th>
                  <td>{ risingMist.procs }</td>
                  <td>{ formatNumber(risingMist.healing) }</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default RisingMist;
