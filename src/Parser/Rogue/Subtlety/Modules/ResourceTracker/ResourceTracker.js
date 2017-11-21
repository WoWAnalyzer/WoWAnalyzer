import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class ResourceTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };  

  gained = 0;
  wasted = 0;
  spent = 0;
  casts = 0;
  current = 0;
  static RESOURCE_TYPE;
  static MAX;

  // stores resource gained/spent/wasted per ability ID
  gainedArray = {};
  spentArray = {};
  wastedArray = {};
  castsArray = {};
  
  static GENERATING_ABILITIES = [
  ];

  static SPENDING_ABILITIES = [
  ];
  
  initBuilderAbility(spellId) {      
    this.constructor.GENERATING_ABILITIES.push(spellId);
    
    this.gainedArray[spellId] = { total: 0 };
    this.wastedArray[spellId] = { total: 0 };
  }
  
  initSpenderAbility(spellId) {      
    this.constructor.SPENDING_ABILITIES.push(spellId);
    
    this.spentArray[spellId] = { total: 0 };
    this.castsArray[spellId] = { count: 0 };
  }
  
  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    const waste = event.waste;
    const gain = event.resourceChange - waste;

    if(!this.shouldProcessEnergizeEvent(event)) {
        return;
    }

    if (this.constructor.GENERATING_ABILITIES.indexOf(spellId) === -1) {
        this.initBuilderAbility(spellId);
    }

    if (waste !== 0) {
      this.wastedArray[spellId].total += waste;
      this.wasted += waste;
    }
    if (gain !== 0) {
      this.gainedArray[spellId].total += gain;
      this.gained += gain;
      this.current += gain;
    }
  }

  shouldProcessEnergizeEvent(event) {
    return event.resourceChangeType === this.constructor.RESOURCE_TYPE;
  }  

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(!this.shouldProcessEnergizeEvent(event)) {
        return;
    }

    const eventResource = event.classResources.filter(r=>r.type === this.constructor.RESOURCE_TYPE)[0];

    const cost = eventResource.cost;

    this.spentArray[spellId].total += cost;
    this.spent += cost;
    this.castsArray[spellId].count += 1;
    this.casts += 1;
    this.current = this.current < cost ? this.current - cost : 0;
  }
  
  shouldProcessCastEvent(event) {
    return true;
  }
}

export default ResourceTracker;