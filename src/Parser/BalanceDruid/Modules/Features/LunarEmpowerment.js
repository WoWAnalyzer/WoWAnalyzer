import React from 'react';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber } from 'common/format';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

class LEmpowerment extends Module {
  lsEmpWasted = 0;
  totalLSEmps = 0;

  isLunarStrike(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.LUNAR_STRIKE.id;
  }
  isStarsurge(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.STARSURGE_MOONKIN.id;
  }

  LunarEmpsActive = 0;
  LunarEmpsOver = 0;

  on_byPlayer_cast(event) {
    if (!this.isLunarStrike(event) && !this.isStarsurge(event)) return;

    if (this.isLunarStrike(event) && this.LunarEmpsActive > 0){
        this.LunarEmpsActive--;
    }
    else if (this.isStarsurge(event)){
      if (this.LunarEmpsActive < 3)
        this.LunarEmpsActive++;
      else
        this.LunarEmpsOver++;
    }
  }

  suggestions(when) {
    const wastedPerMin = ((this.lsEmpWasted) / (this.owner.fightDuration / 100)) * 60;
    when(wastedPerMin).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You overcapped {this.lsEmpWasted / 10} LS Empowerments.</span>)
            .icon('spell_arcane_starfire')
            .actual(`${formatNumber(actual)} overcapped LS Empowerments per minute`)
            .recommended('0 overcapped LS Empowerments is recommended.')
            .regular(recommended + 4).major(recommended + 8);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="spell_arcane_starfire" />}
        value={`${this.lsEmpWasted / 10}`}
        label="Overcapped LSEmp"
        tooltip={'LS Empowerments overcapping is often due to mismanagement of resources, but can also be due to an overwhelming amount of OI procs.'}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(8);
}

export default LEmpowerment;
