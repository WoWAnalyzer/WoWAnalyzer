import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';

import Pets from '../Core/Pets';

const MINDBENDER_UPTIME_MS = 15000;
const MINDBENDER_ADDED_UPTIME_MS_PER_TRAIT = 1500;

class Mindbender extends Module {
  static dependencies = {
    pets: Pets,
  };

  _sourceId = null;
  _damageDone = 0;
  _mindbenders = {};

  on_initialized() {
    this.active     = this.owner.selectedCombatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id);
    this._sourceId  = this.pets.fetchPet(PETS.MINDBENDER).id;
  }

  on_event(event){
    if(event.type === 'damage' && event.sourceID === this._sourceId && this._sourceId !== undefined){
      this._damageDone += event.amount;
    }
  }

  get mindbenders(){
    return Object.keys(this._mindbenders).map(key => this._mindbenders[key]);
  }

  get damageDone(){
    return this._damageDone;
  }

  on_byPlayer_summon(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.MINDBENDER_TALENT_SHADOW.id) {

      this._mindbenders[event.timestamp] = {
        start: event.timestamp,
        end: event.timestamp + MINDBENDER_UPTIME_MS + (MINDBENDER_ADDED_UPTIME_MS_PER_TRAIT * this.owner.selectedCombatant.traitsBySpellId[SPELLS.FIENDING_DARK_TRAIT.id]),
      };
    }
  }

}

export default Mindbender;