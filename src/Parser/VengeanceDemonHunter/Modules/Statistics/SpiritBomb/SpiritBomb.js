import React from 'react';

import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Module from 'Parser/Core/Module';

import { formatPercentage } from 'common/format';

class SpiritBomb extends Module {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  }

  on_initialized() {
      this.active = this.combatants.selected.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id);
  }

  suggestions(when) {
    const spiritBombUptimePercentage = this.enemies.getBuffUptime(SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id) / this.owner.fightDuration;

    when(spiritBombUptimePercentage).isLessThan(0.95)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<span>Try to cast <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> more often. This is your core healing ability by applying <SpellLink id={SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id} /> debuff. Try to refresh it even if you have just one <SpellLink id={SPELLS.SOUL_FRAGMENT.id} /> available.</span>)
        .icon('inv_icon_shadowcouncilorb_purple')
        .actual(`${formatPercentage(spiritBombUptimePercentage)}% debuff total uptime.`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`)
        .regular(recommended - 0.05).major(recommended - 0.15);
    });
  }
}

export default SpiritBomb;
