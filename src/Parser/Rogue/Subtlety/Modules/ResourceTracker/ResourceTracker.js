import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class ResourceTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };  

  generated = 0;
  wasted = 0;
  spent = 0;
  spendersCasts = 0;
  current = 0;
  resourceType;
  resourceName;

  // stores resource gained/spent/wasted per ability ID
  buildersObj = {};
  spendersObj = {};
  
  initBuilderAbility(spellId) {        
    this.buildersObj[spellId] = { generated: 0, wasted: 0 };
  }
  
  initSpenderAbility(spellId) {        
    this.spendersObj[spellId] = { spent: 0, casts: 0 };
  }
  
  //Builders
  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;

    if(!this.shouldProcessEnergizeEvent(event)) {
        return;
    }

    if (!(spellId in this.buildersObj)) {
        this.initBuilderAbility(spellId);
    }

    this.applyBuilder(event);
  }
  
  applyBuilder(event) {
    const spellId = event.ability.guid;
    const waste = event.waste;
    const gain = event.resourceChange - waste;
    
    this.buildersObj[spellId].wasted += waste;
    this.buildersObj[spellId].generated += gain;
    this.wasted += waste;
    this.generated += gain;  

    const eventResource = this.getResource(event);
    if(eventResource !== undefined) {
      this.current = eventResource.amount;
    }
    else {
      this.current += gain;
    }
  }

  shouldProcessEnergizeEvent(event) {
    return event.resourceChangeType === this.resourceType;
  }  

  //Spenders
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(!this.shouldProcessCastEvent(event)) {
        return;
    }
    
    if (!(spellId in this.spendersObj)) {
      this.initSpenderAbility(spellId);
  }

    const eventResource = this.getResource(event);

    const cost = eventResource.cost;

    this.spendersObj[spellId].casts += 1;
    this.spendersCasts += 1;
    if(cost > 0)
    {
      this.spendersObj[spellId].spent += cost;
      this.spent += cost;
    }

    //Re-sync current amount, to update not-tracked gains.
    this.current = eventResource.amount - cost;
  }
  
  shouldProcessCastEvent(event) {
    return this.getResource(event) !== undefined;
  }

  getResource(event) {
    if(event.classResources === undefined) return undefined;
    return event.classResources.find(r=>r.type === this.resourceType);
  }
}

export default ResourceTracker;