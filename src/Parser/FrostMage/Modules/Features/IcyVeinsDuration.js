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

  casts = 0;

  on_initialized() {
	this.active = this.combatants.selected.hasTalent(SPELLS.THERMAL_VOID_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ICY_VEINS.id) {
      return;
    }
    this.casts += 1;
  }

  suggestions(when) {
    const averageDuration = (this.combatants.selected.getBuffUptime(SPELLS.ICY_VEINS.id) / 1000) / this.casts;

    when(averageDuration).isLessThan(45)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.ICY_VEINS.id}/> duration can be improved. Make sure you use Frozen Orb to get Fingers of Frost Procs</span>)
          .icon(SPELLS.ICY_VEINS.icon)
          .actual(`${formatNumber(actual)} seconds Average Icy Veins Duration`)
          .recommended(`${formatNumber(recommended)} is recommended`)
          .regular(40).major(30);
      });
  }

  statistic() {
    const averageDuration = (this.combatants.getBuffUptime(SPELLS.ICY_VEINS.id) / 1000) / this.casts;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ICY_VEINS.id} />}
        value={`${formatNumber(averageDuration)}s`}
        label="Avg Icy Veins Duration"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default IcyVeinsDuration;
