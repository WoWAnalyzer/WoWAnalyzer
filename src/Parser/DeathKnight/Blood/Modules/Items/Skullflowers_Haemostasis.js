import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS';

class SkullflowersHaemostasis extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.SKULLFLOWERS_HAEMOSTASIS.id);
  }

  buffStack=0;
  wastedBuff=0;
  maxBuffStacks = 5;



  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.Haemostasis_Buff.id) {
      this.buffStack+=1;
      console.log("BS Added#", this.buffStack);
    }
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid === SPELLS.Haemostasis_Buff.id) {
      if(this.buffstack >= this.maxBuffStacks) {
        this.wastedBuff+=1;
        this.buffStack = this.maxBuffStacks;
        console.log("BS Wasted");
      }
      else {
        this.buffStack+=1;
      }
      console.log("BS Added#", this.buffStack);
    }
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid === SPELLS.Haemostasis_Buff.id) {
      this.buffStack=0;
      console.log("BS Reset#", this.buffStack);
    }
  }

}

export default SkullflowersHaemostasis;
