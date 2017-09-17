import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber, formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const WHISPER_OF_THE_NATHREZIM_MODIFIER = .15;

class WhisperOfTheNathrezim extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  damageDone = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBack(ITEMS.WHISPER_OF_THE_NATHREZIM.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.WHISPER_OF_THE_NATHREZIM_BUFF.id)) {
      if (event.ability.guid === SPELLS.TEMPLARS_VERDICT_DAMAGE.id || event.ability.guid === SPELLS.DIVINE_STORM_DAMAGE.id) {
        this.damageDone += ((event.amount || 0) + (event.absorbed || 0)) * WHISPER_OF_THE_NATHREZIM_MODIFIER / (1 + WHISPER_OF_THE_NATHREZIM_MODIFIER);
      }
    }
  }

  item() {
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.WHISPER_OF_THE_NATHREZIM_BUFF.id) / this.owner.fightDuration;
    return {
      item: ITEMS.WHISPER_OF_THE_NATHREZIM,
      result: (<dfn data-tip={`
				The effective damage contributed by Whisper of the Nathrezim.<br/>
				Damage: ${this.owner.formatItemDamageDone(this.damageDone)}<br/>
				Total Damage: ${formatNumber(this.damageDone)}<br/>
				Percent Uptime: ${formatPercentage(uptime)}%`}>
          		{this.owner.formatItemDamageDone(this.damageDone)}
       		</dfn>),
    };
  }
}

export default WhisperOfTheNathrezim;
