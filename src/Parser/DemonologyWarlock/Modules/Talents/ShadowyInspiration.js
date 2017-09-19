import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

const BUFF_DURATION = 15000;

class ShadowyInspiration extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  wastedInstants = 0;
  _expectedBuffEnd = undefined;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SHADOWY_INSPIRATION_TALENT.id);
  }

  on_toPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.SHADOWY_INSPIRATION_BUFF.id) {
      return;
    }
    this._expectedBuffEnd = event.timestamp + BUFF_DURATION;
  }

  on_toPlayer_refreshbuff(event) {
    if (event.ability.guid !== SPELLS.SHADOWY_INSPIRATION_BUFF.id) {
      return;
    }
    this.wastedInstants += 1;
    this._expectedBuffEnd = event.timestamp + BUFF_DURATION;
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.SHADOWY_INSPIRATION_BUFF.id) {
      return;
    }
    if (event.timestamp >= this._expectedBuffEnd) {
      // the buff fell off, another wasted instant
      this.wastedInstants += 1;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOWY_INSPIRATION_TALENT.id} />}
        value={this.wastedInstants}
        label="Wasted instant SB/DB"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default ShadowyInspiration;
