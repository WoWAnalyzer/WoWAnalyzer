import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SCHOOLS from 'common/MAGIC_SCHOOLS';


class EmpowerWards extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  hitsWithNoWards = 0;
  hitsWithWards = 0;
  hitsWithWardsOffCD = 0;

  on_toPlayer_damage(event) {
    // Physical
    if (event.ability.type === SCHOOLS.ids.PHYSICAL) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.EMPOWER_WARDS.id, event.timestamp)) {
      this.hitsWithWards += 1;
    }else{
      this.hitsWithNoWards += 1;

      const isAvailable = this.spellUsable.isAvailable(SPELLS.EMPOWER_WARDS.id);
      if(isAvailable) {
        this.hitsWithWardsOffCD += 1;
      }
    }
  }



  statistic() {
    const empoweWardsUptime = this.combatants.selected.getBuffUptime(SPELLS.EMPOWER_WARDS.id);
    const empowerWardsUptimePercentage = empoweWardsUptime / this.owner.fightDuration;
    const hitsWithWardsPercentage = this.hitsWithWards / (this.hitsWithWards + this.hitsWithNoWards);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EMPOWER_WARDS.id} />}
        value={`${formatPercentage(hitsWithWardsPercentage)}%`}
        label="Hits mitigated by Empower Wards"
        tooltip={`Empower Wards usage breakdown:
          <ul>
          <li>You were hit <b>${this.hitsWithWards}</b> times with your Empower Wards buff.</li>
          <li>You were hit <b>${this.hitsWithNoWards}</b> times <b><i>without</i></b> your Empower Wards buff.</li>
          <li>You were hit <b>${this.hitsWithWardsOffCD}</b> times <b><i>with</i></b> Empower Wards  avalible for use but not used.</li>
          </ul></b>
              Empower Wards total uptime: ${formatPercentage(empowerWardsUptimePercentage)}% / (${formatDuration(empoweWardsUptime / 1000)})`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(8);
}

export default EmpowerWards;
