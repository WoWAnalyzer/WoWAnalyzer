import SPELLS from 'common/SPELLS';
import HotTracker from 'parser/shared/modules/HotTracker';

class HotTrackerMW extends HotTracker {

  constructor(...args) {
    super(...args);
    this.mistwrapActive = this.selectedCombatant.hasTalent(SPELLS.MIST_WRAP_TALENT.id);
    this.upwellingActive = this.selectedCombatant.hasTalent(SPELLS.UPWELLING_TALENT.id);
  }

  calculateMaxDuration(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.ENVELOPING_MIST.id){
      return (6000 + (this.mistwrapActive ? 1000 : 0)) * 2;
    }
    if(spellId === SPELLS.ESSENCE_FONT_BUFF.id){
      return (8000 + (this.upwellingActive ? 4000 : 0)) * 2;
    }
    if(event.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id) && spellId === SPELLS.RENEWING_MIST_HEAL.id){
      return 30000 * 2;
    }
    return 20000 * 2;
  }

  calculateMaxRemDuration(event){
    const spellId = event.ability.guid;
    if(event.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id) && spellId === SPELLS.RENEWING_MIST_HEAL.id){
      return 30000;
    }
    return 20000;
  }

  _generateHotInfo() { // must be generated dynamically because it reads from traits
    return {
      [SPELLS.RENEWING_MIST_HEAL.id]: {
        duration: 20000,
        tickPeriod: 2000,
        maxDuration: this.calculateMaxDuration,
        bouncy: true,
        durationConditions: this.calculateMaxRemDuration,
        id: SPELLS.RENEWING_MIST_HEAL.id,
      },
      [SPELLS.ENVELOPING_MIST.id]: {
        duration: 6000 + (this.mistwrapActive ? 1000 : 0),
        tickPeriod: 1000,
        maxDuration: this.calculateMaxDuration,
        id: SPELLS.ENVELOPING_MIST.id,
      },
      [SPELLS.ESSENCE_FONT_BUFF.id]: {
        duration: 8000 + (this.upwellingActive ? 4000 : 0),
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