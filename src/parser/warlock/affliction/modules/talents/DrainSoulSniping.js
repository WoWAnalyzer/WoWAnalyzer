import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/core/modules/Enemies';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS/index';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import SoulShardTracker from '../soulshards/SoulShardTracker';

// limit to filter out relevant removedebuffs (those what I'm interested in happen either at the same timestamp as energize, or about 20ms afterwards (tested on 2 logs, didn't surpass 30ms))
// it's still possible that it can be a coincidence (mob dies and at the same time something falls off somewhere unrelated), but shouldn't happen too much
// I'll test and adjust if needed
const ENERGIZE_REMOVEDEBUFF_THRESHOLD = 100;

class DrainSoulSniping extends Analyzer {
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

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DRAIN_SOUL_TALENT.id);
  }

  on_byPlayer_energize(event) {
    if (event.ability.guid !== SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id) {
      return;
    }
    if (this._lastEnergize !== event.timestamp) {
      this._lastEnergize = event.timestamp;
      this._lastEnergizeWasted = event.waste > 0;
    }
  }

  on_byPlayer_removedebuff(event) {
    if (event.ability.guid !== SPELLS.DRAIN_SOUL_TALENT.id) {
      return;
    }
    if (event.timestamp < this._lastEnergize + ENERGIZE_REMOVEDEBUFF_THRESHOLD) {
      const enemy = this.enemies.getEntity(event);
      if (!enemy) {
        return;
      }
      if (enemy.type === 'NPC') {
        if (!this._removeDebuffs.some(e => e.timestamp === event.timestamp && e.targetID === event.targetID && e.targetInstance === event.targetInstance)) {
          this._removeDebuffs.push({ timestamp: event.timestamp, targetID: event.targetID, targetInstance: event.targetInstance });
        }
      } else if (!this._lastEnergizeWasted) {
        // it's a boss kill and we didn't waste the shard, subtract it
        this._subtractBossShards += 1;
      }
    }
  }

  on_finished() {
    const allEnemies = this.enemies.getEntities();
    this.totalNumOfAdds = Object.values(allEnemies)
      .filter(enemy => enemy.type === 'NPC')
      .reduce((count, enemy) => count + enemy._baseInfo.fights[0].instances, 0);
    this.mobsSniped = this._removeDebuffs.length;
    this._shardsGained = this.soulShardTracker.getGeneratedBySpell(SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id) - this._subtractBossShards;
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
        return suggest(
            <>
              You sniped {formatPercentage(actual)} % of mobs in this fight ({this.mobsSniped} / {this.totalNumOfAdds}) for total of {this._shardsGained} Soul Shards. You could get up to {this.totalNumOfAdds} Shards from them. Try to snipe shards from adds (cast <SpellLink id={SPELLS.DRAIN_SOUL_TALENT.id} /> on them before they die) as it is a great source of extra Soul Shards.<br /><br />
              <small>Note that the number of adds <em>might be a bit higher than usual</em>, as there sometimes are adds that die too quickly, aren't meant to be killed or are not killed in the fight.</small>
            </>
        )
          .icon('ability_hunter_snipershot')
          .actual(`${formatPercentage(actual)} % of mobs sniped.`)
          .recommended(`>= ${formatPercentage(recommended)} % is recommended`);
      });
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<>Shards sniped with <SpellLink id={SPELLS.DRAIN_SOUL_TALENT.id} /></>}
        value={this._shardsGained}
      />
    );
  }
}

export default DrainSoulSniping;
