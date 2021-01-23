import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';

const BUFFER = 250;

/**
 * wild growht has a 40% chance to make your next rejuv or regrowth make 3 more
 */
class MemoryoftheMotherTree extends Analyzer {

  extraRejuvs = 0;
  rejuvHealing = 0;
  rejuvOverhealing = 0;
  rejuvsToTrack: number[] = [];

  extraRegrowths = 0;
  regrowthHealing = 0;
  regrowthOverhealing = 0;
  regrowthToTrack: number[] = [];

  numberWeAreTracking = 0;
  lastCastTimeStamp = 0;

  lastTarget = -1;

  //SPELLS.REJUV == rejuv
  //SPELLS.REGROWTH == regrowth
  spellToListenFor = 0;
  castWithBuffTime = 0;

  totalChances = 0;
  procProbabilities: number[] = [];
  procsGained = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.MEMORY_OF_THE_MOTHER_TREE.bonusID);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.wgCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MEMORY_OF_THE_MOTHER_TREE), this.gotTheProc);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.REGROWTH]), this.whatToTrack);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.REGROWTH]), this.handleApplication);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.REGROWTH]), this.handleApplication);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.REGROWTH]), this.handleHeal);

    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.REGROWTH]), this.handleRemove);
  }

  wgCast(event: CastEvent){
    this.totalChances += 1;
    this.procProbabilities.push(.4);
  }

  gotTheProc(event: ApplyBuffEvent){
    this.procsGained += 1;
    this.numberWeAreTracking += 3;
  }

  whatToTrack(event: CastEvent){
    if(!this.selectedCombatant.hasBuff(SPELLS.MEMORY_OF_THE_MOTHER_TREE.id, event.timestamp, 0, 0, event.sourceID)){
      return;
    }
    this.spellToListenFor = event.ability.guid;
    this.lastTarget = event.targetID || -1;
    this.castWithBuffTime = event.timestamp;
  }

  handleApplication(event: ApplyBuffEvent | RefreshBuffEvent) {
    const targetID = event.targetID;
    const timestamp = event.timestamp;
    const spellId = event.ability.guid;

    if(this.selectedCombatant.hasBuff(SPELLS.CONVOKE_SPIRITS.id)){
      return;
    }

    //precast? remove
    if(this.owner.fight.start_time >= timestamp){
      return;
    }

    //watch out for late events
    if(this.castWithBuffTime + BUFFER < timestamp){
      return;
    }

    //watch out for wrong spell
    if(this.spellToListenFor !== spellId){
      return;
    }

    if(this.lastTarget !== targetID){
      if(this.spellToListenFor === SPELLS.REJUVENATION.id) {
        this.extraRejuvs += 1;
        this.rejuvsToTrack.push(targetID);
      }
      if(this.spellToListenFor === SPELLS.REGROWTH.id) {
        this.extraRegrowths += 1;
        this.regrowthToTrack.push(targetID);
      }
    }
  }

  handleHeal(event: HealEvent) {

    if(event.ability.guid === SPELLS.REJUVENATION.id && this.rejuvsToTrack.find(e => e === event.targetID)) {
      this.rejuvHealing += (event.amount || 0) + (event.absorbed || 0);
      this.rejuvOverhealing += event.overheal || 0;
    }

    if(event.ability.guid === SPELLS.REGROWTH.id && this.regrowthToTrack.find(e => e === event.targetID)) {
      this.regrowthHealing += (event.amount || 0) + (event.absorbed || 0);
      this.regrowthOverhealing += event.overheal || 0;
    }
  }

  handleRemove(event: RemoveBuffEvent){
    const targetID = event.targetID;
    const spellId = event.ability.guid;

    if(spellId === SPELLS.REJUVENATION.id) {
      const toRemove = this.rejuvsToTrack.indexOf(targetID);
      if(toRemove !== -1){
        delete this.rejuvsToTrack[toRemove];
      }
    }

    if(spellId === SPELLS.REGROWTH.id) {
      const toRemove = this.regrowthToTrack.indexOf(targetID);
      if(toRemove !== -1){
        delete this.regrowthToTrack[toRemove];
      }
    }
  }


  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
        <table>
          <tr>
            <th></th>
            <th>Extra</th>
            <th>Healing</th>
            <th>Overhealing</th>
          </tr>
          <tr>
            <td>Rejuvenation</td>
            <td>{this.extraRejuvs}</td>
            <td><ItemHealingDone amount={this.rejuvHealing} /></td>
            <td>{this.rejuvOverhealing}</td>
          </tr>
          <tr>
            <td>Regrowth</td>
            <td>{this.extraRegrowths}</td>
            <td><ItemHealingDone amount={this.regrowthHealing} /></td>
            <td>{this.regrowthOverhealing}</td>
          </tr>
        </table>
        }
      >
        <BoringSpellValueText spell={SPELLS.MEMORY_OF_THE_MOTHER_TREE}>
          <ItemHealingDone amount={this.rejuvHealing + this.regrowthHealing} /><br />
        </BoringSpellValueText>
        {plotOneVariableBinomChart(this.procsGained, this.totalChances, this.procProbabilities)}
      </Statistic>
    );
  }
}

export default MemoryoftheMotherTree;
