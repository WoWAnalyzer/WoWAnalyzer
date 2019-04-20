import React from 'react';
import StatisticBox from 'interface/others/StatisticBox';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

/**
 * Example Report: https://www.warcraftlogs.com/reports/PGMqmyH1b86fW7F2/#fight=55&source=10
 */

class Netherwalk extends Analyzer {

  damageImmuned = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NETHERWALK_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onNetherwalkCast);
  }

  onNetherwalkCast(event) {
    if(!this.selectedCombatant.hasBuff(SPELLS.NETHERWALK_TALENT.id)) {
      return;
    }
      this.damageImmuned.push({
        name: event.ability.name,
      });
  }


  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(6)}
        icon={<SpellIcon id={SPELLS.NETHERWALK_TALENT.id} />}
        value={<>{this.damageImmuned.length} <small>spells immuned</small></>}
        label="Netherwalk"
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(this.damageImmuned).map((e, i) => (
              <tr key={i}>
                <th>{this.damageImmuned[i].name}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </StatisticBox>

    );
  }
}

export default Netherwalk;
