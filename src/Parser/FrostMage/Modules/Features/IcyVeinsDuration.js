import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Module from 'Parser/Core/Module';

class IcyVeinsDuration extends Module {
  static dependencies = {
		combatants: Combatants,
	}
	
  on_initialized() {
	const hasThermalVoid = this.combatants.selected.hasTalent(SPELLS.THERMAL_VOID_TALENT.id);
	this.active = hasThermalVoid;
  }

  IcyVeinsCasts = 0;
	
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ICY_VEINS.id) {
      return;
    }
    this.IcyVeinsCasts += 1;
  }

  suggestions(when) {
    const IcyVeinsUptime = (this.combatants.selected.getBuffUptime(SPELLS.ICY_VEINS.id) / 1000) / this.IcyVeinsCasts;

    when(IcyVeinsUptime).isLessThan(45)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.ICY_VEINS.id}/> uptime can be improved. Make sure you use Frozen Orb to get Fingers of Frost Procs</span>)
          .icon(SPELLS.ICY_VEINS.icon)
          .actual(`${formatNumber(actual)} seconds Average Icy Veins Uptime`)
          .recommended(`${formatNumber(recommended)} is recommended`)
          .regular(40).major(30);
      });
  }

  statistic() {
    const IcyVeinsUptime = (this.combatants.getBuffUptime(SPELLS.ICY_VEINS.id) / 1000) / this.IcyVeinsCasts;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ICY_VEINS.id} />}
        value={`${formatNumber(IcyVeinsUptime)}s`}
        label="Avg Icy Veins Uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default IcyVeinsDuration;
