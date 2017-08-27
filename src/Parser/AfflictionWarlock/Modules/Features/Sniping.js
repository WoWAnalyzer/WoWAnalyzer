import React from 'react';
import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPELLS from 'common/SPELLS';
import SoulShardTracker from '../SoulShards/SoulShardTracker';
import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';

//limit to filter out relevant removedebuffs (those what I'm interested in happen either at the same timestamp as energize, or about 20ms afterwards (tested on 2 logs, didn't surpass 30ms))
//it's still possible that it can be a coincidence (mob dies and at the same time something falls off somewhere unrelated), but shouldn't happen too much
//I'll test and adjust if needed
const ENERGIZE_REMOVEDEBUFF_THRESHOLD = 100;
class Sniping extends Module {
  static dependencies = {
    enemies: Enemies,
    soulShardTracker : SoulShardTracker,
  };

  totalNumOfAdds = 0;

  removeDebuffs = [];
  lastEnergize = 0;

  //this is to avoid counting soul shards from boss kill, the SoulShardTracker module tracks all shards gained and we're not interested in those we gained from boss kill
  subtractBossShards = 0;
  lastEnergizeWasted = false;
  on_byPlayer_energize(event) {
    if (event.ability.guid !== SPELLS.UNSTABLE_AFFLICTION_KILL_SHARD_GEN.id && event.ability.guid !== SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id) {
      return;
    }
    if (this.lastEnergize !== event.timestamp) {
      this.lastEnergize = event.timestamp;
      this.lastEnergizeWasted = event.waste > 0;
    }
  }

  on_byPlayer_removedebuff(event) {
    if (UNSTABLE_AFFLICTION_DEBUFF_IDS.every(id => event.ability.guid !== id) && event.ability.guid !== SPELLS.DRAIN_SOUL.id) {
      return;
    }
    if (event.timestamp < this.lastEnergize + ENERGIZE_REMOVEDEBUFF_THRESHOLD) {
      const enemy = this.enemies.getEntity(event);
      if(!enemy) {
        return;
      }
      if (enemy.type === "NPC") {
        if (!this.removeDebuffs.some(e => e.timestamp === event.timestamp && e.targetID === event.targetID && e.targetInstance === event.targetInstance)) {
          this.removeDebuffs.push({timestamp: event.timestamp, name: event.ability.name, abilityID: event.ability.guid, targetID: event.targetID, targetInstance: event.targetInstance});
        }
      }
      //it's a boss kill and we didn't waste the shard, subtract it
      else if (!this.lastEnergizeWasted) {
          this.subtractBossShards++;
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
  }

  suggestions(when) {
    const mobsSniped = this.removeDebuffs.length;
    const shardsGained = this.soulShardTracker.gained[SPELLS.UNSTABLE_AFFLICTION_KILL_SHARD_GEN.id].shards + this.soulShardTracker.gained[SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id].shards - this.subtractBossShards;
    const mobsSnipedPercentage = mobsSniped / this.totalNumOfAdds;
    when(mobsSnipedPercentage).isLessThan(0.9)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You sniped {formatPercentage(mobsSnipedPercentage)} % of mobs in this fight ({mobsSniped} / {this.totalNumOfAdds}) for total of {shardsGained} Soul Shards. You could get up to {this.totalNumOfAdds * 2} Shards from them. You should try to get at least one shard per add (cast Drain Soul on them before they die) as it is a great source of extra Soul Shards.<br /><br /><small>Note that the number of adds <em>might be a bit higher than usual</em>, as there sometimes are adds that aren't meant to be killed or are not killed in the fight (such as Tormented Soul at the Demonic Inquisition fight).</small></span>)
          .icon('ability_hunter_snipershot')
          .actual(`${formatPercentage(actual)} % of mobs sniped.`)
          .recommended(`>= ${formatPercentage(recommended)} % is recommended`)
          .regular(0.75).major(0.5);
      });
  }

  statistic() {
    const shardsGained = this.soulShardTracker.gained[SPELLS.UNSTABLE_AFFLICTION_KILL_SHARD_GEN.id].shards + this.soulShardTracker.gained[SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id].shards - this.subtractBossShards;
    return (
      <StatisticBox
        icon={<Icon icon='ability_hunter_snipershot'/>}
        value={shardsGained}
        label='Shards sniped'
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(6);
}

export default Sniping;
