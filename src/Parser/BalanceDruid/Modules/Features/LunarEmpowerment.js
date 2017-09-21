import React from 'react';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber } from 'common/format';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

class LEmpowerment extends Module {
  lsEmpWasted = 0;
  aspWasted = 0;

  isLSEmpowerment(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.LUNAR_EMP_BUFF.id;
  }

  on_toPlayer_applybuff(event) {
    if (!this.isLSEmpowerment(event)) return;
  }
  on_toPlayer_changebuffstack(event) {
    if (!this.isLSEmpowerment(event)) return;
  }
  on_toPlayer_removebuff(event) {
    if (!this.isLSEmpowerment(event)) return;
  }

  suggestions(when) {
    const wastedPerMin = ((this.aspWasted) / (this.owner.fightDuration / 100)) * 60;
    when(wastedPerMin).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You overcapped {this.aspWasted / 10} Astral Power. Always prioritize spending it over avoiding the overcap or any other ability.</span>)
            .icon('ability_druid_cresentburn')
            .actual(`${formatNumber(actual)} overcapped Astral Power per minute`)
            .recommended('0 overcapped Astral Power is recommended.')
            .regular(recommended + 4).major(recommended + 8);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="ability_druid_cresentburn" />}
        value={`${this.aspWasted / 10}`}
        label="Overcapped AsP"
        tooltip={'Astral Power overcapping is often due to mismanagement of resources, but can also be due to an overwhelming amount of OI procs.'}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default LEmpowerment;
