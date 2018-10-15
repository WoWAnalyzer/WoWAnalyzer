import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import getDamageBonus from 'parser/monk/brewmaster/modules/core/GetDamageBonus';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

const BONUS_PER_STACK = 0.03;

class ShadowEmbrace extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;

  debuffs = {
    /*
    [target string]: {
      [stack]: {
        start: timestamp,
        uptime: time
      }
    }
     */
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
    this.damage += getDamageBonus(event, shadowEmbrace.stacks * BONUS_PER_STACK);
  }

  get defaultObj() {
    return {
      0: {
        // ignored, see comment in changedebuffstack handler
        start: null,
        uptime: 0,
      },
      1: {
        start: null,
        uptime: 0,
      },
      2: {
        start: null,
        uptime: 0,
      },
      3: {
        start: null,
        uptime: 0,
      },
    };
  }

  on_byPlayer_changedebuffstack(event) {
    if (event.ability.guid !== SPELLS.SHADOW_EMBRACE_DEBUFF.id) {
      return;
    }
    if (event.targetIsFriendly) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    this.debuffs[target] = this.debuffs[target] || this.defaultObj;
    // add uptime on oldStacks, start counting uptime on newStacks
    this.debuffs[target][event.oldStacks].uptime += event.timestamp - this.debuffs[target][event.oldStacks].start;
    this.debuffs[target][event.oldStacks].start = null;
    this.debuffs[target][event.newStacks].start = event.timestamp;
  }

  get stackedUptime() {
    const duration = this.owner.fightDuration;
    const uptimes = {
      1: 0,
      2: 0,
      3: 0,
    };
    Object.values(this.debuffs).forEach((target) => {
      // I got confused trying to iterate through the objects, and this is easier, albeit verbose
      uptimes[1] += target[1].uptime;
      uptimes[2] += target[2].uptime;
      uptimes[3] += target[3].uptime;
    });
    Object.keys(uptimes).forEach(key => {
      uptimes[key] /= duration;
    });
    // we ignore the 0-stack part from this.debuffs:
    // 1) it's unknown when to initialize (encounter start? add spawn?)
    // 2) uptime without stacks is easier to calculate as 1 - "anyStackUptimePercentage"
    const totalUptimePercentage = this.enemies.getBuffUptime(SPELLS.SHADOW_EMBRACE_DEBUFF.id) / duration;
    uptimes[0] = 1 - totalUptimePercentage;
    return uptimes;
  }

  subStatistic() {
    console.log('Stacked uptime', this.stackedUptime);
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.SHADOW_EMBRACE_TALENT.id} /> bonus damage</>}
        value={formatThousands(this.damage)}
        valueTooltip={this.owner.formatItemDamageDone(this.damage)}
      />
    );
  }
}

export default ShadowEmbrace;
