import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';

import Pet from '../Core/Pet';

const MINDBENDER_UPTIME_MS = 15000;
const MINDBENDER_ADDED_UPTIME_MS_PER_TRAIT = 1500;

class Mindbender extends Pet {
  _pet = PETS.MINDBENDER;
  _mindbenders = {};

  on_initialized(){
    this.active = this.owner.selectedCombatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id);

    super.on_initialized();
  }

  get mindbenders(){
    return Object.keys(this._mindbenders).map(key => this._mindbenders[key]);
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