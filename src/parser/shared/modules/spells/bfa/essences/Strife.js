import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { calculatePrimaryStat } from 'common/stats';
import SpellLink from 'common/SpellLink';

import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import DamageTaken from 'parser/shared/modules/throughput/DamageTaken';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import VersatilityIcon from 'interface/icons/Versatility';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatNumber, formatDuration, formatPercentage } from 'common/format';


class Strife extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    healingDone: HealingDone,
    damageDone: DamageDone,
    damageTaken: DamageTaken,
  };

  array = [];
  currentStack = 0;
  vers = 0;
  lastApplication = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.CONFLICT.traitId);
    if (!this.active) {
      return;
    }

    this.vers = calculatePrimaryStat(455, 53, this.selectedCombatant.neck.itemLevel);

    this.statTracker.add(SPELLS.STRIFE_BUFF.id, {
      versatility: this.vers,
    });
    
    this.array[0] = 0;
    this.lastApplication = this.owner.fight.start_time;

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STRIFE_BUFF), this.oneStack);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.STRIFE_BUFF), this.multiStack);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.STRIFE_BUFF), this.lostStacks);
  }

  oneStack(event){
    this.updateUptime(event);
    this.currentStack = 1;

    if(!this.array[this.currentStack]){
      this.array[this.currentStack] = 0;
    }

    this.lastApplication = event.timestamp;
  }

  multiStack(event){
    this.updateUptime(event);

    this.currentStack += 1;

    if(!this.array[this.currentStack]){
      this.array[this.currentStack] = 0;
    }
  }

  lostStacks(event){
    this.updateUptime(event);
    this.currentStack = 0;
  }

  updateUptime(event){
    const timeDifference = event.timestamp - this.lastApplication;
    this.array[this.currentStack] += timeDifference;
    this.lastApplication = event.timestamp;
  }
  

  statistic() {
    const rank = this.selectedCombatant.essenceRank(SPELLS.CONFLICT.traitId);

    const fightDuration = this.owner.fightDuration;

    const event = {
      timestamp: this.owner.fight.end_time,
    };

    this.updateUptime(event);
    let averageVers = 0;
    this.array.forEach((stacks) => {//aka vers * % uptime
      // eslint-disable-next-line no-restricted-syntax
      averageVers += (this.array.indexOf(stacks)*this.vers) * (stacks/fightDuration);
    });

    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <div>
            <table className="table table-condensed">
          <tr>
            <th>Stacks</th>
            <th>Vers</th>
            <th>Uptime</th>
            <th>% Uptime</th>
          </tr>
            {
              this.array.map((stacks) =>(
                  <tr>
                  <td>{// eslint-disable-next-line no-restricted-syntax
                  this.array.indexOf(stacks)}</td>
                  <td>{// eslint-disable-next-line no-restricted-syntax
                  this.array.indexOf(stacks) * this.vers}</td>
                  <td>{formatDuration(stacks/1000)}</td>
                  <td>{formatPercentage(stacks/fightDuration)}%</td>
                </tr>
                
              ))
            }
        </table>
          </div>
        )}
      >
      <div className="pad">
        <label><SpellLink id={SPELLS.STRIFE_BUFF.id} /> - Minor Rank {rank}</label>
        <div className="value">
          <VersatilityIcon /> {formatNumber(averageVers)} <small>average Versatility gained</small>
        </div>
      </div>
      </AzeritePowerStatistic>
    );
  }
}

export default Strife;
