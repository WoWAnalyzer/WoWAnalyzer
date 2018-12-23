import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

const BONUS_PER_STACK = 0.03;
const BUFFER = 50; // for some reason, changedebuffstack triggers twice on the same timestamp for each event, ignore an event if it happened < BUFFER ms after another
const debug = false;

class ShadowEmbrace extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;

  _lastEventTimestamp = null;

  debuffs = {
    0: {
      // ignored, see comment in stackedUptime getter
      start: null,
      count: 1,
      uptime: 0,
    },
    1: {
      start: null,
      count: 0,
      uptime: 0,
    },
    2: {
      start: null,
      count: 0,
      uptime: 0,
    },
    3: {
      start: null,
      count: 0,
      uptime: 0,
    },
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SHADOW_EMBRACE_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const shadowEmbrace = enemy.getBuff(SPELLS.SHADOW_EMBRACE_DEBUFF.id);
    if (!shadowEmbrace) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, shadowEmbrace.stacks * BONUS_PER_STACK);
  }

  on_byPlayer_changedebuffstack(event) {
    if (event.ability.guid !== SPELLS.SHADOW_EMBRACE_DEBUFF.id) {
      return;
    }
    if (event.targetIsFriendly) {
      return;
    }
    if (this._lastEventTimestamp !== null && event.timestamp <= this._lastEventTimestamp + BUFFER) {
      debug && console.log(`!! (${this.owner.formatTimestamp(event.timestamp, 3)}) ignoring duplicate event`);
      return;
    }
    this._lastEventTimestamp = event.timestamp;
    debug && console.log(`-- (${this.owner.formatTimestamp(event.timestamp, 3)}) changedebuffstack on ${encodeTargetString(event.targetID, event.targetInstance)}`);

    const oldStacks = this.debuffs[event.oldStacks];
    const newStacks = this.debuffs[event.newStacks];
    oldStacks.count = Math.max(oldStacks.count - 1, 0);
    debug && console.log(`OLD (${event.oldStacks}), count reduced to ${oldStacks.count}`);
    if (oldStacks.count === 0) {
      oldStacks.uptime += event.timestamp - oldStacks.start;
      debug && console.log(`OLD (${event.oldStacks}) count 0, updated uptime to ${oldStacks.uptime}`);
    }

    if (newStacks.count === 0) {
      newStacks.start = event.timestamp;
      debug && console.log(`NEW (${event.newStacks}) count 0, started counting`);
    }
    newStacks.count += 1;
    debug && console.log(`NEW (${event.newStacks}), count increased to ${newStacks.count}`);
  }

  get totalUptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.SHADOW_EMBRACE_DEBUFF.id) / this.owner.fightDuration;
  }

  get stackedUptime() {
    const duration = this.owner.fightDuration;
    // it's easier to calculate no stack uptime as 1 - anyStackUptimePercentage, that's why we ignore this.debuffs[0]
    return {
      0: 1 - this.totalUptimePercentage,
      1: this.debuffs[1].uptime / duration,
      2: this.debuffs[2].uptime / duration,
      3: this.debuffs[3].uptime / duration,
    };
  }

  subStatistic() {
    const uptimes = this.stackedUptime;
    return (
      <>
        <StatisticListBoxItem
          title={<><SpellLink id={SPELLS.SHADOW_EMBRACE_DEBUFF.id} /> uptime</>}
          value={`${formatPercentage(this.totalUptimePercentage)} %`}
          valueTooltip={`No stacks: ${formatPercentage(uptimes[0])} %<br />
            1 stack: ${formatPercentage(uptimes[1])} %<br />
            2 stacks: ${formatPercentage(uptimes[2])} %<br />
            3 stacks: ${formatPercentage(uptimes[3])} %`}
        />
        <StatisticListBoxItem
          title={<><SpellLink id={SPELLS.SHADOW_EMBRACE_TALENT.id} /> bonus damage</>}
          value={this.owner.formatItemDamageDone(this.damage)}
          valueTooltip={`${formatThousands(this.damage)} bonus damage`}
        />
      </>
    );
  }
}

export default ShadowEmbrace;
