import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';

import Pet from '../core/Pet';
import Voidform from './Voidform';

const MINDBENDER_UPTIME_MS = 15000;

class Mindbender extends Pet {
  static dependencies = {
    ...Pet.dependencies,
    voidform: Voidform,
  };

  _pet = PETS.MINDBENDER;
  _mindbenders = {};

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id);
  }

  get suggestionStackThresholds() {
    return mindbender => ({
      actual: mindbender.voidformStacks,
      isLessThan: {
        minor: 15,
        average: 12,
        major: 10,
      },
      style: 'number',
    });
  }

  get mindbenders() {
    return Object.keys(this._mindbenders).map(timestamp => this._mindbenders[timestamp]);
  }

  on_byPlayer_summon(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MINDBENDER_TALENT_SHADOW.id) {
      return;
    }

    this._mindbenders[event.timestamp] = {
      voidformStacks: (this.voidform.inVoidform && this.voidform.currentVoidform.stacks[this.voidform.currentVoidform.stacks.length - 1].stack) || 0,
    };

    if (!this.voidform.inVoidform) {
      return;
    }

    const duration = MINDBENDER_UPTIME_MS;
    this.voidform.addVoidformEvent(SPELLS.MINDBENDER_TALENT_SHADOW.id, {
      start: this.voidform.normalizeTimestamp(event),
      end: this.voidform.normalizeTimestamp({ timestamp: event.timestamp + duration }),
      stack: this.voidform.currentVoidform.stacks[this.voidform.currentVoidform.stacks.length - 1].stack,
    });
  }
}

export default Mindbender;
