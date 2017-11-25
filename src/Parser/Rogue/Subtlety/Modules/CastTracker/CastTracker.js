import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class CastTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };  

  totalCasts = 0;
  castsObj = {};

    
  initSpell(spellId) {        
    this.castsObj[spellId] = this.createAggregate();
  }

  // Casts
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(!this.shouldProcessCastEvent(event)) {
        return;
    }
    
    if (!(spellId in this.castsObj)) {
      this.initSpell(spellId);
    }

    this.totalCasts += 1;
    const aggregate = this.castsObj[spellId];
    this.applyCastEvent(event, aggregate);
  }
  
  shouldProcessCastEvent(event) {
    return true;
  }

  createAggregate() {
    return { casts: 0 };
  }

  applyCastEvent(event, aggregate) {
    aggregate.casts += 1;
  }
}

export default CastTracker;