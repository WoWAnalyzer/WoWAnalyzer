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
  inVulnerabilityAimed = 0;
  outsideVulnerabilityAimed = 0;

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy.hasBuff(SPELLS.VULNERABLE.id, event.timestamp)) {
      this.inVulnerabilityAimed += 1;
    }
    else {
      this.outsideVulnerabilityAimed += 1;
    }
    this.totalAimed += 1;
  }
  suggestions(when) {
    const percentAimedOutsideVulnerable = 100/this.totalAimed * this.outsideVulnerabilityAimed;
    when(percentAimedOutsideVulnerable).isGreaterThan(0.02)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You have casted {this.outsideVulnerabilityAimed} <SpellLink id={SPELLS.AIMED_SHOT.id} />s outside <SpellLink id={SPELLS.VULNERABLE.id} />. Try and minimize these, as they deal significantly less damage than their <SpellLink id={SPELLS.VULNERABLE.id} /> counterparts. It should be noted that rarely, you will be casting non-vulnerable aimeds due to no procs and/or focus capping. </span>)
          .icon(SPELLS.AIMED_SHOT.icon)
          .actual(`${formatPercentage(actual/100)}% of total Aimed Shots were outside Vulnerable`)
          .recommended(`<${recommended*100}% is recommended, with 0% being the ideal`)
          .regular(recommended + 0.02).major(recommended + 0.04);
      });
  }
  statistic() {
    const percentAimedInVulnerable = this.inVulnerabilityAimed / this.totalAimed;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VULNERABLE.id} />}
        value={`${formatPercentage(percentAimedInVulnerable)}%`}
        label="Vulnerable Aimed Shots"
        tooltip={`You cast ${this.totalAimed} Aimed Shots.<br/> The amount of Aimed Shot casts inside Vulnerable: ${this.inVulnerabilityAimed}.<br/> The amount of Aimed Shot casts outside Vulnerable: ${this.outsideVulnerabilityAimed}. `} />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default AimedInVulnerableTracker;
