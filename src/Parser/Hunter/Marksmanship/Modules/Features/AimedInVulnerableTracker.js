import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from "common/format";

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class AimedInVulnerableTracker extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
    spellUsable: SpellUsable,
  };
  totalAimed = 0;
  inVulnerabilityAimed = 0;
  outsideVulnerabilityAimed = 0;
  focusDumpAimed = 0;

  on_byPlayer_cast(event) {
    const windburstIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.WINDBURST.id);
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy.hasBuff(SPELLS.VULNERABLE.id, event.timestamp)) {
      this.inVulnerabilityAimed += 1;
    } else {
      if (windburstIsOnCooldown && !this.combatants.selected.hasBuff(SPELLS.MARKING_TARGETS.id) && event.classResources[0]['amount'] > 105) {
        this.focusDumpAimed += 1;
      }
      this.outsideVulnerabilityAimed += 1;
    }
    this.totalAimed += 1;
  }
  suggestions(when) {
    const percentAimedOutsideVulnerable = this.outsideVulnerabilityAimed / this.totalAimed;
    const percentFocusDumpAimed = this.focusDumpAimed / this.totalAimed;
    when(percentAimedOutsideVulnerable).isGreaterThan(0.02)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You cast {this.outsideVulnerabilityAimed} <SpellLink id={SPELLS.AIMED_SHOT.id} />s outside <SpellLink id={SPELLS.VULNERABLE.id} />. Try and minimize these, as they deal significantly less damage than their <SpellLink id={SPELLS.VULNERABLE.id} /> counterparts. It should be noted that rarely, you will be casting non-vulnerable aimeds due to no procs and/or focus capping. <br /> Note: <SpellLink id={SPELLS.VULNERABLE.id} /> damage is calculated on <u><strong>CAST END</strong></u>, so Aimed Shot does not have to hit inside the window, for it to register properly - use this knowledge to your advantage to squeeze more <SpellLink id={SPELLS.AIMED_SHOT.id} />s inside the <SpellLink id={SPELLS.VULNERABLE.id} /> window. </span>)
          .icon(SPELLS.AIMED_SHOT.icon)
          .actual(`${formatPercentage(actual)}% of total Aimed Shots were outside Vulnerable, ${formatPercentage(percentFocusDumpAimed/actual)}% of those were to dump focus`)
          .recommended(`<${formatPercentage(recommended)}% outside Vulnerable is recommended, with 0% being the ideal`)
          .regular(recommended + 0.01).major(recommended + 0.02);
      });
  }
  statistic() {
    const percentAimedInVulnerable = this.inVulnerabilityAimed / this.totalAimed;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VULNERABLE.id} />}
        value={`${formatPercentage(percentAimedInVulnerable)}%`}
        label="Vulnerable Aimed Shots"
        tooltip={` You cast ${this.totalAimed} Aimed Shots.<br/> The amount of Aimed Shot casts inside Vulnerable: ${this.inVulnerabilityAimed}.<br/> The amount of Aimed Shot casts outside Vulnerable: ${this.outsideVulnerabilityAimed}. <br/> Amount of Aimed Shot outside vulnerable to dump focus: ${this.focusDumpAimed}.`} />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default AimedInVulnerableTracker;
