import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';

const BUFF_DURATION = 12000;
const REGULAR_PENANCE_COOLDOWN_MS = 9000;

class Tier20_4set extends Analyzer {
  _lastProcTimestamp = null;
  _procCount = 0;
  _consumeCount = 0;

  get procs() {
    return this._procCount;
  }

  get consumptions() {
    return this._consumeCount;
  }

  get penanceCooldownSaved() {
    return (this._consumeCount * REGULAR_PENANCE_COOLDOWN_MS) / 2;
  }

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.DISC_PRIEST_T20_4SET_BONUS_PASSIVE.id);
  }

  on_toPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.DISC_PRIEST_T20_4SET_BONUS_BUFF.id) {
      return;
    }
    this._lastProcTimestamp = event.timestamp;
    this._procCount += 1;
  }

  on_toPlayer_refreshbuff(event) {
    if (event.ability.guid !== SPELLS.DISC_PRIEST_T20_4SET_BONUS_BUFF.id) {
      return;
    }
    this._lastProcTimestamp = event.timestamp;
    this._procCount += 1;
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.DISC_PRIEST_T20_4SET_BONUS_BUFF.id) {
      return;
    }
    if (event.timestamp < (this._lastProcTimestamp + BUFF_DURATION)) {
      this._consumeCount += 1;
    }
  }

  suggestions(when) {
    const utilisation =  (this._consumeCount / this._procCount) || 0;

    when(utilisation).isLessThan(0.8)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You had {this._procCount} <SpellLink id={SPELLS.DISC_PRIEST_T20_4SET_BONUS_BUFF.id}> Penitent </SpellLink> procs, but only used it {this._consumeCount} times. Try to use this proc when it is available.</span>)
            .icon(SPELLS.PENANCE.icon)
            .actual(`${formatPercentage(utilisation)}% of procs used`)
            .recommended('>80.00% recommenaded.')
            .regular(recommended - 0.05).major(recommended - 0.1);
        });
  }

  item() {
    const penanceCooldownSaved = (this.penanceCooldownSaved / 1000) || 0;
    const consumptions = this.consumptions || 0;

    return {
      id: `spell-${SPELLS.DISC_PRIEST_T20_4SET_BONUS_PASSIVE.id}`,
      icon: <SpellIcon id={SPELLS.DISC_PRIEST_T20_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.DISC_PRIEST_T20_4SET_BONUS_BUFF.id} icon={false} />,
      result: (
        <Wrapper>
          {penanceCooldownSaved} seconds off the cooldown, {consumptions} Penances cast earlier
        </Wrapper>
      ),
    };
  }
}

export default Tier20_4set;
