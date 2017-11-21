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
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if(!enemy) {
      return;
    }
    if (enemy.hasBuff(SPELLS.VULNERABLE.id, event.timestamp)) {
      this.inVulnerabilityAimed += 1;
    } else {
      const windburstIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.WINDBURST.id);
      if (windburstIsOnCooldown && !this.combatants.selected.hasBuff(SPELLS.MARKING_TARGETS.id) && event.classResources[0]['amount'] > 105) {
        this.focusDumpAimed += 1;
      }
      this.outsideVulnerabilityAimed += 1;
    }
    this.totalAimed += 1;
  }
  suggestions(when) {
    const percentBadAimedShots = (this.outsideVulnerabilityAimed - this.focusDumpAimed) / this.totalAimed;
    const percentFocusDumpAimed = this.focusDumpAimed / this.totalAimed;
    when(percentFocusDumpAimed).isGreaterThan(0.02)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You cast {this.focusDumpAimed} <SpellLink id={SPELLS.AIMED_SHOT.id} />s to dump focus. This is more than what one would normally attribute to bad luck, and can indicate that you aren't utilizing <SpellLink id={SPELLS.MARKED_SHOT.id} /> or <SpellLink id={SPELLS.WINDBURST.id} /> properly to generate <SpellLink id={SPELLS.VULNERABLE.id} /> on your target. </span>)
          .icon(SPELLS.AIMED_SHOT.icon)
          .actual(`${formatPercentage(actual)}% of total Aimed Shots were outside Vulnerable to dump focus`)
          .recommended(`<${formatPercentage(recommended)}% focus dump no Aimed Shots is recommended, with 0% being the ideal`)
          .regular(recommended + 0.01).major(recommended + 0.02);
      });
    when(percentBadAimedShots).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You cast {(this.outsideVulnerabilityAimed - this.focusDumpAimed)} <SpellLink id={SPELLS.AIMED_SHOT.id} />s outside <SpellLink id={SPELLS.VULNERABLE.id} /> and without high enough focus to warrant focus dumping.<br /> <b>Only cast <SpellLink id={SPELLS.AIMED_SHOT.id} /> outside of <SpellLink id={SPELLS.VULNERABLE.id} /> when you're at 95 focus or more, and you don't have <SpellLink id={SPELLS.MARKED_SHOT.id} /> or <SpellLink id={SPELLS.WINDBURST.id} /> ready. </b> <br /> <b>Note:</b> <SpellLink id={SPELLS.VULNERABLE.id} /> damage is calculated <u><b>when the cast finishes</b></u>, so <SpellLink id={SPELLS.AIMED_SHOT.id} /> does not have to hit inside the window for it to register properly - use this knowledge to your advantage to squeeze more <SpellLink id={SPELLS.AIMED_SHOT.id} />s inside the <SpellLink id={SPELLS.VULNERABLE.id} /> window. </span>)
          .icon(SPELLS.AIMED_SHOT.icon)
          .actual(`${formatPercentage(actual)}% of total Aimed Shots were outside Vulnerable without a need to dump focus`)
          .recommended(`No Aimed Shots should be cast outside Vulnerable, unless you're close to focus capping`)
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
        tooltip={` You cast ${this.totalAimed} Aimed Shots. <ul> <li> The amount of Aimed Shot casts inside Vulnerable: ${this.inVulnerabilityAimed}.</li> <li>The amount of Aimed Shot casts outside Vulnerable without a need to focus dump: ${this.outsideVulnerabilityAimed - this.focusDumpAimed}. </li> <li> Amount of Aimed Shot outside vulnerable to dump focus: ${this.focusDumpAimed}. </li></ul>`} />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default AimedInVulnerableTracker;
