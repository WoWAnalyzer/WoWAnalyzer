import React from 'react';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import BoringValue from 'parser/ui/BoringValueText';

import { t } from '@lingui/macro';

import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const REGROWTH_HEALING_INCREASE = 2;
const REJUVENATION_HEALING_INCREASE = 2;
const WILD_GROWTH_HEALING_INCREASE = 0.75;

const WILD_GROWTH_BUFFER = 500;


class SoulOfTheForest extends Analyzer {

  listening = false;
  listenForWildGrowth = false;
  wildGrowthTimestamp = 0;

  regrowthBuffed = 0;
  rejuvBuffed = 0;
  wildGrowthsBuffed = 0;

  regrowthHealing = 0;
  rejuvHealing = 0;
  wildGrowthHealing = 0;

  regrowthList: number[] = [];
  rejuvList: number[] = [];
  wildGrowthList: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id);
    if(!this.active){
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SOUL_OF_THE_FOREST_BUFF), this.startListening);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.applyRegrowth);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION), this.applyRejuv);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.castWildGrowth);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.applyWildGrowths);

    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.refreshRegrowth);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION), this.refreshRejuv);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.refreshWildGrowth);

    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.removeRegrowth);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION), this.removeRejuv);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.removeWildGrowth);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.regrowthHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION), this.rejuvHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.wildGrowthHeal);
  }

  startListening(event: ApplyBuffEvent) {
    this.listening = true;
  }

  applyRegrowth(event: CastEvent) {
    if(!this.listening){
      return;
    }
    this.listening = false;
    this.regrowthList.push(event.targetID!);
    this.regrowthBuffed += 1;
  }

  applyRejuv(event: CastEvent) {
    if(!this.listening){
      return;
    }
    this.listening = false;
    this.rejuvList.push(event.targetID!);
    this.rejuvBuffed += 1;
  }

  castWildGrowth(event: CastEvent) {
    //We track the next 5 wild boys
    if(!this.listening){
      return;
    }
    this.listening = false;
    this.listenForWildGrowth = true;
    this.wildGrowthTimestamp = event.timestamp;
    this.wildGrowthsBuffed += 1;
  }

  applyWildGrowths(event: ApplyBuffEvent){
    if(!this.listenForWildGrowth){
      return;
    }
    if(event.timestamp > this.wildGrowthTimestamp + WILD_GROWTH_BUFFER){
      this.listenForWildGrowth = false;
      return;
    }
    this.wildGrowthList.push(event.targetID);
  }

  refreshRegrowth(event: RefreshBuffEvent) {
    //if we are not listening then we need to remove it from the list
    if(!this.listening) {
      delete this.regrowthList[event.targetID];
    }
  }

  refreshRejuv(event: RefreshBuffEvent) {
    //if we are not listening then we need to remove it from the list
    if(!this.listening) {
      delete this.rejuvList[event.targetID];
    }
  }

  refreshWildGrowth(event: RefreshBuffEvent) {
    //if we are not listening then we need to remove it from the list
    if(this.listenForWildGrowth && event.timestamp < this.wildGrowthTimestamp + WILD_GROWTH_BUFFER) {
      //double check we are not already on the list for some weird reason
      if(!this.wildGrowthList.includes(event.targetID)){
        this.wildGrowthList.push(event.targetID);
    }
    }else{//if we are listening we need to add it to the list
      delete this.wildGrowthList[event.targetID];
      this.listenForWildGrowth = false;
    }

  }

  removeRegrowth(event: RemoveBuffEvent) {
    delete this.regrowthList[event.targetID];
  }

  removeRejuv(event: RemoveBuffEvent) {
    delete this.rejuvList[event.targetID];
  }

  removeWildGrowth(event: RemoveBuffEvent) {
    delete this.wildGrowthList[event.targetID];
  }

  regrowthHeal(event: HealEvent) {
    if(this.regrowthList.includes(event.targetID)){
      this.regrowthHealing += calculateEffectiveHealing(event, REGROWTH_HEALING_INCREASE);
    }
  }

  rejuvHeal(event: HealEvent) {
    if(this.rejuvList.includes(event.targetID)){
      this.rejuvHealing += calculateEffectiveHealing(event, REJUVENATION_HEALING_INCREASE);
    }
  }

  wildGrowthHeal(event: HealEvent) {
    if(this.wildGrowthList.includes(event.targetID)){
      this.wildGrowthHealing += calculateEffectiveHealing(event, WILD_GROWTH_HEALING_INCREASE);
    }
  }


  get wgUsagePercent() {
    return this.wildGrowthsBuffed / (this.wildGrowthsBuffed + this.regrowthBuffed + this.rejuvBuffed);
  }

  get suggestionThresholds() {
    return {
      actual: this.wgUsagePercent,
      isLessThan: {
        minor: 0.80,
        average: 0.70,
        major: 0.60,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You did not consume all your <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} /> buffs with <SpellLink id={SPELLS.WILD_GROWTH.id} />.
          Try to use <SpellLink id={SPELLS.WILD_GROWTH.id} /> every time you get a <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} /> buff.</span>)
        .icon(SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.icon)
        .actual(t({
      id: "druid.restoration.suggestions.soulOfTheForest.efficiency",
      message: `Wild growth consumed ${formatPercentage(this.wgUsagePercent)}% of all the buffs.`
    }))
        .recommended(`${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    const proccs = (this.wildGrowthsBuffed + this.regrowthBuffed + this.rejuvBuffed);

    const total = this.wildGrowthHealing + this.rejuvHealing + this.regrowthHealing;
    const totalPercent = this.owner.getPercentageOfTotalHealingDone(total);

    const wgPercent = this.owner.getPercentageOfTotalHealingDone(this.wildGrowthHealing);
    const rejuvPercent = this.owner.getPercentageOfTotalHealingDone(this.rejuvHealing);
    const regrowthPercent = this.owner.getPercentageOfTotalHealingDone(this.regrowthHealing);

    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(20)}
        tooltip={(
          <>
            You gained {proccs} total Soul of the Forest procs.
            <ul>
              <li>Consumed {this.wildGrowthsBuffed} procs with Wild Growth for {formatPercentage(wgPercent)}% healing</li>
              <li>Consumed {this.rejuvBuffed} procs with Rejuvenation for {formatPercentage(rejuvPercent)}% healing</li>
              <li>Consumed {this.regrowthBuffed} procs with Regrowth for {formatPercentage(regrowthPercent)}% healing</li>
            </ul>
          </>
        )}
      >
        <BoringValue label={<><SpellIcon id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} /> Soul of the Forest healing</>}>
          <>
            {formatPercentage(totalPercent)} %
          </>
        </BoringValue>
      </Statistic>
    );
  }
}

export default SoulOfTheForest;
