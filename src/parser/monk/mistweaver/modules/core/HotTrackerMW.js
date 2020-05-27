import SPELLS from 'common/SPELLS';
import HotTracker from 'parser/shared/modules/HotTracker';

const REM_BASE_DURATION = 20000;
const ENV_BASE_DURATION = 6000;
const EF_BASE_DURATION = 8000;

const UPWELLING = 4000;
const MISTWRAP = 1000;
const TFT_REM_EXTRA_DURATION = 10000;

class HotTrackerMW extends HotTracker {

  constructor(...args) {
    super(...args);
    this.mistwrapActive = this.selectedCombatant.hasTalent(SPELLS.MIST_WRAP_TALENT.id);
    this.upwellingActive = this.selectedCombatant.hasTalent(SPELLS.UPWELLING_TALENT.id);
  }

  calculateMaxDuration(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.ENVELOPING_MIST.id){
      return (ENV_BASE_DURATION + (this.mistwrapActive ? MISTWRAP : 0)) * 2;
    }
    if(spellId === SPELLS.ESSENCE_FONT_BUFF.id){
      return (EF_BASE_DURATION + (this.upwellingActive ? UPWELLING : 0)) * 2;
    }
    if(event.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id) && spellId === SPELLS.RENEWING_MIST_HEAL.id){
      return (REM_BASE_DURATION + TFT_REM_EXTRA_DURATION) * 2;
    }
    return REM_BASE_DURATION * 2;
  }

  calculateMaxRemDuration(event){
    const spellId = event.ability.guid;
    if(event.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id) && spellId === SPELLS.RENEWING_MIST_HEAL.id){
      return (REM_BASE_DURATION + TFT_REM_EXTRA_DURATION);
    }
    return REM_BASE_DURATION;
  }

  _generateHotInfo() { // must be generated dynamically because it reads from traits
    return {
      [SPELLS.RENEWING_MIST_HEAL.id]: {
        duration: REM_BASE_DURATION,
        tickPeriod: 2000,
        maxDuration: this.calculateMaxDuration,
        bouncy: true,
        durationConditions: this.calculateMaxRemDuration,
        id: SPELLS.RENEWING_MIST_HEAL.id,
      },
      [SPELLS.ENVELOPING_MIST.id]: {
        duration: ENV_BASE_DURATION + (this.mistwrapActive ? MISTWRAP : 0),
        tickPeriod: 1000,
        maxDuration: this.calculateMaxDuration,
        id: SPELLS.ENVELOPING_MIST.id,
      },
      [SPELLS.ESSENCE_FONT_BUFF.id]: {
        duration: EF_BASE_DURATION + (this.upwellingActive ? UPWELLING : 0),
        tickPeriod: 2000,
        maxDuration: this.calculateMaxDuration,
        id: SPELLS.ESSENCE_FONT_BUFF.id,
      },
    };
  }

  _generateHotList(){
    return [SPELLS.RENEWING_MIST_HEAL,SPELLS.ENVELOPING_MIST,SPELLS.ESSENCE_FONT_BUFF];
  }
}

export default HotTrackerMW;