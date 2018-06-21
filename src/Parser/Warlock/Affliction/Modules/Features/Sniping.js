import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import SoulShardTracker from '../SoulShards/SoulShardTracker';
import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';

// limit to filter out relevant removedebuffs (those what I'm interested in happen either at the same timestamp as energize, or about 20ms afterwards (tested on 2 logs, didn't surpass 30ms))
// it's still possible that it can be a coincidence (mob dies and at the same time something falls off somewhere unrelated), but shouldn't happen too much
// I'll test and adjust if needed
const ENERGIZE_REMOVEDEBUFF_THRESHOLD = 100;

class Sniping extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    soulShardTracker: SoulShardTracker,
  };

  _removeDebuffs = [];
  _lastEnergize = 0;

  // this is to avoid counting soul shards from boss kill, the SoulShardTracker module tracks all shards gained and we're not interested in those we gained from boss kill
  _subtractBossShards = 0;
  _lastEnergizeWasted = false;

  _shardsGained = 0;

  totalNumOfAdds = 0;
  mobsSniped = 0;

  on_byPlayer_energize(event) {
    if (event.ability.guid !== SPELLS.UNSTABLE_AFFLICTION_KILL_SHARD_GEN.id && event.ability.guid !== SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id) {
      return;
    }
    if (this._lastEnergize !== event.timestamp) {
      this._lastEnergize = event.timestamp;
      this._lastEnergizeWasted = event.waste > 0;
    }
  }

  on_byPlayer_removedebuff(event) {
    if (!UNSTABLE_AFFLICTION_DEBUFF_IDS.includes(event.ability.guid) && event.ability.guid !== SPELLS.DRAIN_SOUL_TALENT.id) {
      return;
    }
    if (event.timestamp < this._lastEnergize + ENERGIZE_REMOVEDEBUFF_THRESHOLD) {
      const enemy = this.enemies.getEntity(event);
      if (!enemy) {
        return;
      }
      if (enemy.type === 'NPC') {
        if (!this._removeDebuffs.some(e => e.timestamp === event.timestamp && e.targetID === event.targetID && e.targetInstance === event.targetInstance)) {
          this._removeDebuffs.push({ timestamp: event.timestamp, name: event.ability.name, abilityID: event.ability.guid, targetID: event.targetID, targetInstance: event.targetInstance });
        }
      } else if (!this._lastEnergizeWasted) {
        // it's a boss kill and we didn't waste the shard, subtract it
        this._subtractBossShards += 1;
      }
    }
  }

  on_finished() {
    const allEnemies = this.enemies.getEntities();
    this.totalNumOfAdds = Object.keys(allEnemies)
      .map(x => allEnemies[x])
      .filter(enemy => enemy.type === 'NPC')
      .reduce((count, enemy) => count + enemy._baseInfo.fights[0].instances, 0);
    this.active = this.totalNumOfAdds > 0;
    this.mobsSniped = this._removeDebuffs.length;
    this._shardsGained = this.soulShardTracker.generatedAndWasted[SPELLS.UNSTABLE_AFFLICTION_KILL_SHARD_GEN.id].generated + this.soulShardTracker.generatedAndWasted[SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id].generated - this._subtractBossShards;
  }

  get suggestionThresholds() {
    return {
      actual: this.mobsSniped / this.totalNumOfAdds,
      isLessThan: {
        minor: 0.9,
        average: 0.75,
        major: 0.5,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You sniped {formatPercentage(actual)} % of mobs in this fight ({this.mobsSniped} / {this.totalNumOfAdds}) for total of {this._shardsGained} Soul Shards. You could get up to {this.totalNumOfAdds * 2} Shards from them. Try to get at least one shard per add (cast <SpellLink id={SPELLS.DRAIN_SOUL_TALENT.id} /> on them before they die) as it is a great source of extra Soul Shards.<br /><br /><small>Note that the number of adds <em>might be a bit higher than usual</em>, as there sometimes are adds that die too quickly, aren't meant to be killed or are not killed in the fight (such as Tormented Soul at the Demonic Inquisition fight).</small></React.Fragment>)
          .icon('ability_hunter_snipershot')
          .actual(`${formatPercentage(actual)} % of mobs sniped.`)
          .recommended(`>= ${formatPercentage(recommended)} % is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="ability_hunter_snipershot" />}
        value={this._shardsGained}
        label="Shards sniped"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default Sniping;
