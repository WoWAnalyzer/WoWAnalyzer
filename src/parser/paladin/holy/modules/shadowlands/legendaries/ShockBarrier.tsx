import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

//const BUFF_DURATION = 18000;
const LAST_SHIELD = 12000;

/**
 * When you cast holy shock place a buff on someone for 18 second that gives them a sheild every 6 seconds
 */
class ShockBarrier extends Analyzer {

  shockBarriersWasted = 0;
  activeBarriers: Array<{target: number, timestamp: number}> = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.SHOCK_BARRIER.bonusID);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHOCK_BARRIER), this.buffApplied);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SHOCK_BARRIER), this.refreshBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SHOCK_BARRIER), this.buffRemoved);
  }

  buffApplied(event: ApplyBuffEvent){
    this.activeBarriers.push({
      target: event.targetID,
      timestamp: event.timestamp,
    });
  }

  refreshBuff(event: RefreshBuffEvent){
    this.activeBarriers = this.activeBarriers.filter(element => element.target !== event.targetID);

    this.activeBarriers.push({
      target: event.targetID,
      timestamp: event.timestamp,
    });
  }

  buffRemoved(event: RemoveBuffEvent){
    const person = this.activeBarriers.find(element => element.target === event.targetID);

    // If true then we bad
    if(person !== undefined && person.timestamp + LAST_SHIELD > event.timestamp){
      this.shockBarriersWasted += 1;
    }

    this.activeBarriers = this.activeBarriers.filter(element => element.target !== event.targetID);
  }


  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
        <>
          You can only have 5 Shock Barrier out at a time but the last shield it provides is 12 seconds into its buff meaning the last 6 seconds are pointless. This takes that into account.
        </>}
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.SHOCK_BARRIER.id}>Shock Barrier</SpellLink>'s wasted</label>
          <div className="value">
            {this.shockBarriersWasted}
          </div>
        </div>
      </Statistic>
    );
  }
}

export default ShockBarrier;