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
import Wrapper from 'common/Wrapper';

/**
 * Vulnerable
 * Damage taken from Aimed Shot and Piercing Shot increased by 30% for 7 sec.
 */

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
    if (!enemy) {
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

  get aimedShotsOutsideVulnerablePercent() {
    return (this.outsideVulnerabilityAimed - this.focusDumpAimed) / this.totalAimed;
  }

  get focusDumpAimedShotsPercent() {
    return this.focusDumpAimed / this.totalAimed;
  }

  get focusDumpThreshold() {
    return {
      actual: this.focusDumpAimedShotsPercent,
      isGreaterThan: {
        minor: 0.02,
        average: 0.03,
        major: 0.05,
      },
      style: 'percentage',
    };
  }

  get nonVulnerableAimedShotThreshold() {
    return {
      actual: this.aimedShotsOutsideVulnerablePercent,
      isGreaterThan: {
        minor: 0,
        average: 0.01,
        major: 0.03,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.focusDumpThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper> You cast {this.focusDumpAimed} <SpellLink id={SPELLS.AIMED_SHOT.id} />s to dump focus. This is more than what one would normally attribute to bad luck, and can indicate that you aren't utilizing <SpellLink id={SPELLS.MARKED_SHOT.id} /> or <SpellLink id={SPELLS.WINDBURST.id} /> properly to generate <SpellLink id={SPELLS.VULNERABLE.id} /> on your target. </Wrapper>)
        .icon(SPELLS.AIMED_SHOT.icon)
        .actual(`${formatPercentage(actual)}% of total Aimed Shots were outside Vulnerable to dump focus`)
        .recommended(`<${formatPercentage(recommended)}% focus dump Aimed Shots is recommended, with 0% being the ideal`);
    });
    when(this.nonVulnerableAimedShotThreshold).addSuggestion((suggest, actual) => {
      return suggest(<Wrapper> You cast {this.outsideVulnerabilityAimed} <SpellLink id={SPELLS.AIMED_SHOT.id} />s outside <SpellLink id={SPELLS.VULNERABLE.id} /> and without high enough focus to warrant focus dumping.<br /> <b>Only cast <SpellLink id={SPELLS.AIMED_SHOT.id} /> outside of <SpellLink id={SPELLS.VULNERABLE.id} /> when you're at 95 focus or more, and you don't have <SpellLink id={SPELLS.MARKED_SHOT.id} /> or <SpellLink id={SPELLS.WINDBURST.id} /> ready. </b> <br /> <b>Note:</b> <SpellLink id={SPELLS.VULNERABLE.id} /> damage is calculated <u><b>when the cast finishes</b></u>, so <SpellLink id={SPELLS.AIMED_SHOT.id} /> does not have to hit inside the window for it to register properly - use this knowledge to your advantage to squeeze more <SpellLink id={SPELLS.AIMED_SHOT.id} />s inside the <SpellLink id={SPELLS.VULNERABLE.id} /> window. </Wrapper>)
        .icon(SPELLS.AIMED_SHOT.icon)
        .actual(`${formatPercentage(actual)}% of total Aimed Shots were outside Vulnerable without a need to dump focus`)
        .recommended(`No Aimed Shots should be cast outside Vulnerable, unless you're close to focus capping`);
    });
  }
  statistic() {
    const percentAimedInVulnerable = this.inVulnerabilityAimed / this.totalAimed;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VULNERABLE.id} />}
        value={`${formatPercentage(percentAimedInVulnerable)}%`}
        label="Vulnerable Aimed Shots"
        tooltip={` You cast ${this.totalAimed} Aimed Shots. <ul> <li> The amount of Aimed Shot casts inside Vulnerable: ${this.inVulnerabilityAimed}.</li> <li>The amount of Aimed Shot casts outside Vulnerable without a need to focus dump: ${this.outsideVulnerabilityAimed - this.focusDumpAimed}. </li> <li> Amount of Aimed Shot casts outside vulnerable to dump focus: ${this.focusDumpAimed}. </li></ul>`} />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default AimedInVulnerableTracker;
