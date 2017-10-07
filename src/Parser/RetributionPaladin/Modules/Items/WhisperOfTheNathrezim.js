import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import { formatNumber, formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import GetDamageBonus from '../PaladinCore/GetDamageBonus';

const WHISPER_OF_THE_NATHREZIM_MODIFIER = 0.15;

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
        this.damageDone += GetDamageBonus(event, WHISPER_OF_THE_NATHREZIM_MODIFIER);
      }
    }
  }

  item() {
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.WHISPER_OF_THE_NATHREZIM_BUFF.id) / this.owner.fightDuration;
    return {
      item: ITEMS.WHISPER_OF_THE_NATHREZIM,
      result: (<dfn data-tip={`
        The effective damage contributed by Whisper of the Nathrezim.<br/>
				Total Damage: ${formatNumber(this.damageDone)}<br/>
				Percent Uptime: ${formatPercentage(uptime)}%`}>
        {this.owner.formatItemDamageDone(this.damageDone)}
      </dfn>),
    };
  }

  suggestions(when) {
    when(this.owner.getPercentageOfTotalDamageDone(this.damageDone)).isLessThan(0.055)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your usage of <ItemLink id={ITEMS.WHISPER_OF_THE_NATHREZIM.id} /> can be improved. Make sure to save up five holy power before your next <SpellLink id={SPELLS.JUDGMENT_CAST.id} /> window to get more time on the Whisper buff.</span>)
          .icon(ITEMS.WHISPER_OF_THE_NATHREZIM.icon)
          .actual(`${this.owner.formatItemDamageDone(this.damageDone)} damage contributed`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.005).major(recommended - 0.015);
      });
  }
}

export default WhisperOfTheNathrezim;
