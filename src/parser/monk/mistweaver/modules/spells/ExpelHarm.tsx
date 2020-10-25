import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';

class ExpelHarm extends Analyzer {

    selfHealing: number = 0;
    selfOverheal: number = 0;
    targetHealing: number = 0;
    targetOverheal: number = 0;
    gustsHealing: number = 0;
    lastCastTarget: number = -1;
    sourceTarget: number = -1;
    numberToCount: number = 0;

    constructor(options: Options){
      super(options);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EXPEL_HARM), this.handleExpelHarm);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EXPEL_HARM_TARGET_HEAL), this.handleTargetExpelHarm);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS), this.handleMastery);
    }

    handleExpelHarm(event: HealEvent) {
        this.selfHealing += (event.amount || 0) + (event.absorbed || 0);
        this.selfOverheal += (event.overheal || 0);
        this.numberToCount += 1;
        this.sourceTarget = event.targetID;
    }

    handleTargetExpelHarm(event: HealEvent) {
        this.targetHealing += (event.amount || 0 ) + (event.absorbed || 0);
        this.targetOverheal += (event.overheal || 0);
        this.numberToCount +=1;
        this.lastCastTarget = event.targetID;
    }

    handleMastery(event: HealEvent) {
        if ((event.targetID === this.lastCastTarget || event.targetID === this.sourceTarget) && this.numberToCount > 0) {
            this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
            this.numberToCount -= 1;
          }
    }
}

export default ExpelHarm;
