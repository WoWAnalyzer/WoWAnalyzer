import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

class ExpelHarm extends Analyzer {
    static dependencies = {
        abilityTracker: AbilityTracker,
        combatants: Combatants,
    };

    selfHealing = 0;
    targetHealing = 0;
    gustsHealing = 0;
    lastCastTarget = null;
    sourceTarget = null;
    numberToCount = 0;
    
    constructor(...args) {
        super(...args);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EXPEL_HARM), this.handleExpelHarm);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EXPEL_HARM_TARGET_HEAL), this.handleTargetExpelHarm);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS), this.handleMastery);
    }

    handleExpelHarm(event) {
        this.selfHealing += (event.amount || 0) + (event.absorbed || 0);
        this.numberToCount += 1;
        this.sourceTarget = event.targetID;
    }

    handleTargetExpelHarm(event) {
        this.targetHealing += (event.amount || 0 ) + (event.absorbed || 0);
        this.numberToCount +=1;
        this.lastCastTarget = event.targetID;
    }

    handleMastery(event) {
        if ((event.targetID === this.lastCastTarget || event.targetID === this.sourceTarget) && this.numberToCount > 0) {
            this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
            this.numberToCount -= 1;
          }
    }
}

export default ExpelHarm;