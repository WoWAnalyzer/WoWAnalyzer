import React from 'react';
import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPELLS from 'common/SPELLS';
import SoulShardTracker from '../SoulShards/SoulShardTracker';

class Sniping extends Module {
  static dependencies = {
    enemies: Enemies,
    soulShardTracker : SoulShardTracker,
  };

  totalNumOfAdds = 0;
  on_finished() {
    const allEnemies = this.enemies.getEntities();
    this.totalNumOfAdds = Object.keys(allEnemies)
      .map(x => allEnemies[x])
      .filter(enemy => enemy.type === 'NPC')
      .reduce((count, enemy) => count + enemy._baseInfo.fights[0].instances, 0);
    this.active = this.totalNumOfAdds > 0;
  }

  suggestions(when) {
    const shardsGained = this.soulShardTracker.gained[SPELLS.UNSTABLE_AFFLICTION_KILL_SHARD_GEN.id].shards + this.soulShardTracker.gained[SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id].shards;
    when(shardsGained).isLessThan(this.totalNumOfAdds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You only got {shardsGained} shards from the {this.totalNumOfAdds} adds in this fight. You could get up to {this.totalNumOfAdds * 2} Shards from them. You should try to get at least one shard per add (cast Drain Soul on them before they die) as it is a great source of extra Soul Shards.<br /><br /><small>Note that the number of adds <em>might be a bit higher than usual</em>, as there sometimes are adds that aren't meant to be killed or are not killed in the fight (such as Tormented Soul at the Demonic Inquisition fight).</small></span>)
          .icon('ability_hunter_snipershot')
          .actual(`${actual} Soul Shards gained.`)
          .recommended(`>= ${recommended} is recommended`)
          .regular(Math.floor(recommended * 0.75)).major(Math.floor(recommended * 0.5)); //regular = we sniped at least 75% adds, major = < 50% adds
      });
    // const shardsPerAdd = shardsGained / this.totalNumOfAdds;
    // when(shardsPerAdd).isLessThan(1)
    //   .addSuggestion((suggest, actual, recommended) => {
    //     return suggest(<span>You only got {shardsGained} shards from the {this.totalNumOfAdds} adds in this fight. You could get up to {this.totalNumOfAdds * 2} Shards from them. You should try to get at least one shard per add (cast Drain Soul on them before they die) as it is a great source of extra Soul Shards.<br /><br /><small>Note that the number of adds <em>might be a bit higher than usual</em>, as there sometimes are adds that aren't meant to be killed or are not killed in the fight (such as Tormented Soul at the Demonic Inquisition fight).</small></span>)
    //       .icon('ability_hunter_snipershot')
    //       .actual(`${actual.toFixed(2)} Soul Shards per add gained.`)
    //       .recommended(`>= ${recommended} is recommended`)
    //       .regular(0.75).major(0.5);
    //   });
  }

  statistic() {
    const shardsGained = this.soulShardTracker.gained[SPELLS.UNSTABLE_AFFLICTION_KILL_SHARD_GEN.id].shards + this.soulShardTracker.gained[SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id].shards;
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
