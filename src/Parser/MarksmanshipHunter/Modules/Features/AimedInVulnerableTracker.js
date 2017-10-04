import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from "common/format";

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class AimedInVulnerableTracker extends Module {
  static dependencies = {
    enemies: Enemies,
  };
  totalAimed = 0;
  inVulnAimed = 0;
  outsideVulnAimed = 0;

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy.hasBuff(SPELLS.VULNERABLE.id, event.timestamp)) {
      this.inVulnAimed += 1;
    }
    if (!enemy.hasBuff(SPELLS.VULNERABLE.id, event.timestamp)) {
      this.outsideVulnAimed += 1;
    }
    this.totalAimed += 1;
  }
  suggestions(when) {
    const aimedOutsideVuln = this.outsideVulnAimed;
    when(aimedOutsideVuln).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You have {this.outsideVulnAimed} <SpellLink id={SPELLS.AIMED_SHOT.id} />s outside <SpellLink id={SPELLS.VULNERABLE.id} />. Try and minimize these, as they deal significantly less damage than their vulnerable counterparts. It should be noted that rarely, you will be casting non-vulnerable aimeds due to no procs and/or focus capping. </span>)
          .icon(SPELLS.AIMED_SHOT.icon)
          .actual(`${(actual)} aimed shot(s) outside vulnerable`)
          .recommended(`${recommended} is recommended`)
          .regular(recommended + 1).major(recommended + 2);
      });
  }
  statistic() {
    const percentVulnInAimed = this.inVulnAimed / this.totalAimed;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VULNERABLE.id} />}
        value={`${formatPercentage(percentVulnInAimed)}%`}
        label="Vulnerable aimed shots"
        tooltip={`The total amount of aimed shots was: ${this.totalAimed}.<br/> The amount of aimed shots inside vulnerable: ${this.inVulnAimed}.<br/> The amount of aimed shots outside vulnerable: ${this.outsideVulnAimed}. `} />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default AimedInVulnerableTracker;
