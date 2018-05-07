import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SCHOOLS from 'common/MAGIC_SCHOOLS';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

class DemonSpikes extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  hitsWithDS = 0;
  hitsWithoutDS = 0;
  hitsWithDSOffCD = 0;

  on_toPlayer_damage(event) {
    // Physical
    if (event.ability.type !== SCHOOLS.ids.PHYSICAL) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.DEMON_SPIKES_BUFF.id, event.timestamp)) {
      this.hitsWithDS += 1;
    }else{
      this.hitsWithoutDS += 1;

      const isAvailable = this.spellUsable.isAvailable(SPELLS.DEMON_SPIKES.id);
      if(isAvailable) {
        this.hitsWithDSOffCD += 1;
      }
    }
  }

  get mitigatedUptime(){
    return formatPercentage(this.hitsWithDS / (this.hitsWithDS + this.hitsWithoutDS));
  }

  statistic() {
    const demonSpikesUptime = this.combatants.selected.getBuffUptime(SPELLS.DEMON_SPIKES_BUFF.id);

    const demonSpikesUptimePercentage = demonSpikesUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEMON_SPIKES.id} />}
        value={`${this.mitigatedUptime}%`}
        label="Hits Mitigated by Demon Spikes"
        tooltip={`Demon Spikes usage breakdown:
          <ul>
          <li>You were hit <b>${this.hitsWithDS}</b> times with your Demon Spikes buff.</li>
          <li>You were hit <b>${this.hitsWithoutDS}</b> times <b><i>without</i></b> your Demon Spikes buff.</li>
          <li>You were hit <b>${this.hitsWithDSOffCD}</b> times <b><i>with</i></b> Demon Spikes avalible for use but not used.</li>
          </ul>
          <b>Your overall uptime was <b>${formatPercentage(demonSpikesUptimePercentage)}%</b>.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default DemonSpikes;
