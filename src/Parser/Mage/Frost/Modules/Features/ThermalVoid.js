import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';

class ThermalVoid extends Analyzer {

  static dependencies = {
    combatants: Combatants,
	}

  casts = 0;
  buffApplied = 0;
  extraUptime = 0;

  on_initialized() {
	   this.active = this.combatants.selected.hasTalent(SPELLS.THERMAL_VOID_TALENT.id);
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(spellId === SPELLS.ICY_VEINS.id) {
      this.casts += 1;
      this.buffApplied = event.timestamp;
    }
  }

  on_finished() {
    if (this.combatants.selected.hasBuff(SPELLS.ICY_VEINS.id)) {
      this.casts -= 1;
      this.extraUptime = this.owner.currentTimestamp - this.buffApplied;
    }
  }

  suggestions(when) {
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.ICY_VEINS.id) - this.extraUptime;
    const averageDuration = (uptime / this.casts) / 1000;
    when(averageDuration).isLessThan(40)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.ICY_VEINS.id}/> duration can be improved. Make sure you use Frozen Orb to get Fingers of Frost Procs</span>)
          .icon(SPELLS.ICY_VEINS.icon)
          .actual(`${formatNumber(actual)} seconds Average Icy Veins Duration`)
          .recommended(`${formatNumber(recommended)} is recommended`)
          .regular(35).major(30);
      });
  }

  statistic() {
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.ICY_VEINS.id) - this.extraUptime;
    const averageDuration = (uptime / this.casts) / 1000;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ICY_VEINS.id} />}
        value={`${formatNumber(averageDuration)}s`}
        label="Avg Icy Veins Duration"
        tooltip={"Icy Veins Casts that do not complete before the fight ends are removed from this statistic"}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default ThermalVoid;
