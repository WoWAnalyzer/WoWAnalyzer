import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from "common/SpellIcon";
import { formatNumber, formatPercentage } from "common/format";
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';

import CooldownTracker from '../Features/CooldownThroughputTracker';

/*
 * When your abilities damage a target below 20% health, you gain 1% increased critical strike chance for 6 sec, stacking up to 30 times.
 */
class Bullseye extends Analyzer {
  executeTimestamp;
  bullseyeResets = 0; //only resets when boss < 20% health, so resets we can confirm shouldn't have happened
  bullseyeInstances = [];
  bossIDs = [];
  MAX_STACKS = 30;
  EXECUTE_PERCENT = .2;
  static dependencies = {
    cooldownTracker: CooldownTracker,
    combatants: Combatants,
  };

  on_initialized() {
    this.owner.report.enemies.forEach(enemy => {
      enemy.fights.forEach(fight => {
        if (fight.id === this.owner.fight.id && enemy.type === "Boss") this.bossIDs.push(enemy.id);
      });
    });
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.BULLSEYE_TRAIT.id];
  }
  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.BULLSEYE_BUFF.id) {
      return;
    }
    this.bullseyeInstances.push({ "start": event.timestamp - this.owner.fight.start_time });
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.BULLSEYE_BUFF.id) {
      return;
    }
    const lastBullseyeIndex = this.bullseyeInstances.length - 1;
    if (event.stack === this.MAX_STACKS) {
      this.bullseyeInstances[lastBullseyeIndex].maxStacksTimestamp = event.timestamp - this.owner.fight.start_time;
    }
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.BULLSEYE_BUFF.id) {
      return;
    }
    const lastBullseyeIndex = this.bullseyeInstances.length - 1;
    if (this.executeTimestamp) {
      this.bullseyeResets++;
      this.bullseyeInstances[lastBullseyeIndex].duringExecute = true;
    }
    this.bullseyeInstances[lastBullseyeIndex].end = event.timestamp - this.owner.fight.start_time;
  }

  on_byPlayer_damage(event) {
    if (event.targetInstance === undefined && event.maxHitPoints && this.bossIDs.indexOf(event.targetID) !== -1) {
      if ((event.hitPoints / event.maxHitPoints) <= this.EXECUTE_PERCENT && !this.executeTimestamp) {
        this.executeTimestamp = event.timestamp - this.owner.fight.start_time;
      }
    }
  }

  statistic() {
    const lastBullseyeIndex = this.bullseyeInstances.length - 1;

    if (this.bullseyeInstances[lastBullseyeIndex] && !this.bullseyeInstances[lastBullseyeIndex].end) {
      this.bullseyeInstances[lastBullseyeIndex].end = this.owner.fight.end_time - this.owner.fight.start_time;
    }
    this.bullseyeUptime = 0;
    this.bullseyeMaxUptime = 0;
    this.bullseyeInstances.forEach(instance => {
      this.bullseyeUptime += instance.end - instance.start;
      if (instance.maxStacksTimestamp) {
        this.bullseyeMaxUptime += instance.end - instance.maxStacksTimestamp;
      }
    });
    this.percentBullseyeAtMax = formatPercentage(this.bullseyeMaxUptime / this.bullseyeUptime);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BULLSEYE_BUFF.id} />}
        value={`${this.percentBullseyeAtMax}%`}
        label={`% of Bullseye at ${this.MAX_STACKS} stacks`}
        tooltip={`You reset Bullseye ${this.bullseyeResets} times during the execute phase (boss below 20% health). <br /> You had ${formatNumber(this.bullseyeUptime / 1000)} seconds of Bullseye uptime during the fight, and ${formatNumber(this.bullseyeMaxUptime / 1000)} seconds of uptime at ${this.MAX_STACKS} stacks.`}
      />
    );
  }

  get bullseyeResetThreshold() {
    return {
      actual: this.bullseyeResets,
      isGreaterThan: {
        minor: 0.1,
        average: 0.3,
        major: 0.5,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.bullseyeResets).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper> You reset your <SpellLink id={SPELLS.BULLSEYE_BUFF.id} icon /> stacks while the boss was below 20% health. Try and avoid this as it is a significant DPS loss. Make sure you're constantly refreshing and adding to your bullseye stacks on targets below 20% hp.</Wrapper>)
          .icon('ability_hunter_focusedaim')
          .actual(`${this.bullseyeResets} resets`)
          .recommended(`<1 reset is recommended`)
          .major(recommended);
      });
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default Bullseye;
