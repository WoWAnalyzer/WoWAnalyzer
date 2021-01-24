import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

/**
 * Rejuv has 2.5% chance per heal to randomly make another rejuv
 *
 */
class VisionOfUnendingGrowth extends Analyzer {

  extraRejuvs = 0;

  healing = 0;
  overhealing = 0;

  lastTarget: number | undefined = undefined;

  rejuvsToTrack: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.VISION_OF_UNENDING_GROWTH.bonusID);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION), this.rejuvCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION), this.rejuvHeal);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION), this.rejuvBuffApplied);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION), this.rejuvBuffRefreshed);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION), this.rejuvBuffRemoved);
  }

  rejuvCast(event: CastEvent) {
    this.lastTarget = event.targetID;
  }

  rejuvHeal(event: HealEvent) {
    if(this.rejuvsToTrack.find(e => e === event.targetID)) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.overhealing += event.overheal || 0;
    }
  }

  rejuvBuffApplied(event: ApplyBuffEvent) {
    this.handleApplication(event.targetID, event.timestamp);
  }

  rejuvBuffRefreshed(event: RefreshBuffEvent) {
    this.handleRemove(event.targetID);
    this.handleApplication(event.targetID, event.timestamp);
  }

  rejuvBuffRemoved(event: RemoveBuffEvent) {
    this.handleRemove(event.targetID);

  }

  handleApplication(targetID: number, timestamp: number) {
    if(this.selectedCombatant.hasBuff(SPELLS.CONVOKE_SPIRITS.id)){
      return;
    }

    //precast? remove
    if(this.owner.fight.start_time >= timestamp){
      return;
    }

    if(this.lastTarget !== targetID){
      this.extraRejuvs += 1;
      this.rejuvsToTrack.push(targetID);
    }
  }

  handleRemove(targetID: number){
    const toRemove = this.rejuvsToTrack.indexOf(targetID);
    if(toRemove !== -1){
      delete this.rejuvsToTrack[toRemove];
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={<>Extra Rejuvs: {this.extraRejuvs}</>}
      >
        <BoringSpellValueText spell={SPELLS.VISION_OF_UNENDING_GROWTH}>
          <ItemHealingDone amount={this.healing} /><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VisionOfUnendingGrowth;
