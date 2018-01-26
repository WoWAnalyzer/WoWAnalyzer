import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';

import Pet from '../Core/Pet';
import Voidform from './Voidform';


const MINDBENDER_UPTIME_MS = 15000;
const MINDBENDER_ADDED_UPTIME_MS_PER_TRAIT = 1500;

class Mindbender extends Pet {
  static dependencies = {
    ...Pet.dependencies,
    voidform: Voidform,
  };

  _pet = PETS.MINDBENDER;
  _mindbenders = {};

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id);

    super.on_initialized();
  }

  get suggestionStackThresholds() {
    return (mindbender) => ({
      actual: mindbender.voidformStacks,
      isLessThan: {
        minor: 23,
        average: 21,
        major: 19,
      },
      style: 'number',
    });
  }

  get mindbenders() {
    return Object.keys(this._mindbenders).map(timestamp => this._mindbenders[timestamp]);
  }

  on_byPlayer_summon(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MINDBENDER_TALENT_SHADOW.id) return;

    this._mindbenders[event.timestamp] = {
      voidformStacks: (this.voidform.inVoidform && this.voidform.currentVoidform.stacks[this.voidform.currentVoidform.stacks.length -1].stack) || 0,
    };


    if(!this.voidform.inVoidform) return;
    const duration = MINDBENDER_UPTIME_MS + (MINDBENDER_ADDED_UPTIME_MS_PER_TRAIT * this.combatants.selected.traitsBySpellId[SPELLS.FIENDING_DARK_TRAIT.id]);
    this.voidform.addVoidformEvent(SPELLS.MINDBENDER_TALENT_SHADOW.id, {
      start: this.voidform.normalizeTimestamp(event),
      end: this.voidform.normalizeTimestamp({timestamp: event.timestamp + duration}),
      stack: this.voidform.currentVoidform.stacks[this.voidform.currentVoidform.stacks.length -1].stack,
    });


  }
}

export default Mindbender;
