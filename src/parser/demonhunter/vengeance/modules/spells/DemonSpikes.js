import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import SCHOOLS from 'common/MAGIC_SCHOOLS';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class DemonSpikes extends Analyzer {
  static dependencies = {
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
    if (this.selectedCombatant.hasBuff(SPELLS.DEMON_SPIKES_BUFF.id, event.timestamp)) {
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

  suggestions(when) {
    const hitsWithDSOffCDPercent = this.hitsWithDSOffCD / (this.hitsWithDS+ this.hitsWithoutDS);
    when(hitsWithDSOffCDPercent).isGreaterThan(0.15)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<> Cast <SpellLink id={SPELLS.DEMON_SPIKES.id} /> more regularly while actively tanking the boss or when they use a big phsyical attack. You missed having it up for {formatPercentage(hitsWithDSOffCDPercent)}% of physical hits.</>)
          .icon(SPELLS.DEMON_SPIKES.icon)
          .actual(`${formatPercentage(actual)}% unmitigated physical hits`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.2);
      });
  }

  statistic() {
    const demonSpikesUptime = this.selectedCombatant.getBuffUptime(SPELLS.DEMON_SPIKES_BUFF.id);

    const demonSpikesUptimePercentage = demonSpikesUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(2)}
        icon={<SpellIcon id={SPELLS.DEMON_SPIKES.id} />}
        value={`${this.mitigatedUptime}%`}
        label="Hits mitigated by Demon Spikes"
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
}

export default DemonSpikes;
