import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

class Tactician extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  totalTacticianProccs = 0;
  lastTacticianTimestamp = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.TACTICIAN.id !== spellId) {
      return;
    }
    // Get the applied timestamp
    this.lastTacticianTimestamp = event.timestamp;
    debug && console.log('Tactician was applied');
    this.totalTacticianProccs += 1;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.TACTICIAN.id !== spellId) {
      return;
    }
    // Get the applied timestamp
    this.lastTacticianTimestamp = event.timestamp;
    debug && console.log('Tactician was refreshed');
    this.totalTacticianProccs += 1;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TACTICIAN.id} />}
        value={this.totalTacticianProccs}
        label="Total Tactician Proccs"
        tooltip={`Tactician resets the cooldown on Colossus Smash and Mortal Strike. You got ${this.totalTacticianProccs} more Mortal Strike and Colossus Smash.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);
}

export default Tactician;
