import React from 'react';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { formatDuration, formatPercentage, formatNumber } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';

import UptimeIcon from 'interface/icons/Uptime';
import PrimaryStatIcon from 'interface/icons/PrimaryStat';
import ItemStatistic from 'interface/statistics/ItemStatistic';

import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import Combatants from 'parser/shared/modules/Combatants';

const debug = false;

const MAX_SHARDS = 4; 

// Log using minor: https://www.warcraftlogs.com/reports/QnWhPJNz76ALRCby/#fight=1&source=11
// Log using major (Russian language): https://www.warcraftlogs.com/reports/Bv7QGZcW3YMHt9NA#fight=72&type=damage-done&source=398
// Possible improvement: Just activating the Major whenever it's available may not be optimal. Better to only use it if you'll be stood still for some time and do not already have a high stack count. In practice no spec is recommended to take this essence as a major so few players would actually benefit from a more in-depth analysis. It would be difficult to get that analysis accurate as it'd need to account for shards from other players for which we don't have full information.
class WorldveinResonance extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    combatants: Combatants,
  };

  _hasMajor = false;
  _statPerShard = 0;
  _othersWithMinor = 0;
  _othersWithMajor = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.WORLDVEIN_RESONANCE.traitId);
    if (!this.active) {
      return;
    }

    if (this.selectedCombatant.hasMajor(SPELLS.WORLDVEIN_RESONANCE.traitId)) {
      this._hasMajor = true;
      this.abilities.add({
        spell: SPELLS.WORLDVEIN_RESONANCE,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.80,
          },
      });
    }

    Object.values(this.combatants.players).filter(combatant => combatant !== this.selectedCombatant).forEach(combatant => {
      if (combatant.hasEssence(SPELLS.WORLDVEIN_RESONANCE.traitId)) {
        this._othersWithMinor += 1;
        debug && this.log(`${combatant.name} has minor`);
        if (combatant.hasMajor(SPELLS.WORLDVEIN_RESONANCE.traitId)) {
          this._othersWithMajor += 1;
          debug && this.log(`${combatant.name} has major`);
        }
      }
    });

    this._statPerShard = calculatePrimaryStat(400, 127, this.selectedCombatant.neck.itemLevel);
    debug && this.log(`stat per shard: ${this._statPerShard}`);
  }

  get shardStackUptimes() {
    return this.selectedCombatant.getStackBuffUptimes(SPELLS.LIFEBLOOD_BUFF.id);
  }

  get anyShardsUptime() {
    const uptimes = this.shardStackUptimes;
    return Object.keys(uptimes).reduce((accumulator, stackCount) => {
      if (stackCount > 0) {
        return accumulator + uptimes[stackCount];
      }
      return accumulator;
    }, 0);
  }
  get anyShardsUptimeFraction() {
    return this.anyShardsUptime / this.owner.fightDuration;
  }

  get maxShardsUptime() {
    return this.shardStackUptimes[MAX_SHARDS] || 0;
  }
  get maxShardsUptimeFraction() {
    return this.maxShardsUptime / this.owner.fightDuration;
  }

  get averageStat() {
    return this._statPerShard * this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.LIFEBLOOD_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    const primaryStat = this.selectedCombatant.spec.primaryStat;
    const uptimes = this.shardStackUptimes;
    return (
      <ItemStatistic
        size="flexible"
        dropdown={(
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>{primaryStat} Bonus</th>
                <th>Time (s)</th>
                <th>Time (%)</th>
              </tr>
            </thead>
            <tbody>
              {
                Object.keys(uptimes).map((stackCount) => {
                  return (
                    <tr key={stackCount}>
                      <th>{this._statPerShard * stackCount}</th>
                      <td>{formatDuration(uptimes[stackCount] / 1000) || 0}</td>
                      <td>{formatPercentage(uptimes[stackCount] / this.owner.fightDuration)}</td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        )}
        tooltip={(
          <>
            Others with Worldvein Resonance minor: <b>{this._othersWithMinor}</b> <br />
            Others with Worldvein Resonance major: <b>{this._othersWithMajor}</b> <br />
            Shards have a 12 yard range so movement and positioning of players with the essence has a significant effect.
          </>
        )}
        >
      <div className="pad">
        <label><SpellLink id={SPELLS.WORLDVEIN_RESONANCE.id} /><small> {this._hasMajor ? 'Major' : 'Minor'} Rank {this.selectedCombatant.essenceRank(SPELLS.WORLDVEIN_RESONANCE.traitId)}</small></label>
        <div className="value">
          <UptimeIcon /> {formatPercentage(this.anyShardsUptimeFraction)}% <small>at least 1 shard uptime</small><br />
          <UptimeIcon /> {formatPercentage(this.maxShardsUptimeFraction)}% <small>{MAX_SHARDS} shard uptime</small><br />
          <PrimaryStatIcon stat={primaryStat} /> {formatNumber(this.averageStat)} <small>average {primaryStat} gained</small><br />
        </div>
      </div>
    </ItemStatistic>
    );
  }
}

export default WorldveinResonance;
