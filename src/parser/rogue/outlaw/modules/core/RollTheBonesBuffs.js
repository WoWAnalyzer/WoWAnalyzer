import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

const BUFFS = [
  //SPELLS.RUTHLESS_PRECISION,
  SPELLS.GRAND_MELEE,
  SPELLS.BROADSIDE,
  SPELLS.SKULL_AND_CROSSBONES,
  SPELLS.BURIED_TREASURE,
  SPELLS.TRUE_BEARING,
];

class SliceAndDiceUptime extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id);
  }

  percentUptime(spellid) {
    return this.selectedCombatant.getBuffUptime(spellid) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(100)}
        tooltip="Slice and Dice uptime"
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Stacks</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            {BUFFS.map((e) => (
              <tr key={e.id}>
                <th><SpellLink id={e.id} /></th>
                <td>{`${formatPercentage(this.percentUptime(e.id))} %`}</td>
                </tr>
            ))}
          </tbody>
        </table>
      </Statistic>
    );
  }
}

export default SliceAndDiceUptime;
