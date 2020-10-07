import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Events, { SummonEvent } from 'parser/core/Events';

import Pet from '../core/Pet';
import Voidform from './Voidform';
import { MINDBENDER_UPTIME_MS } from '../../constants';

class Mindbender extends Pet {
  static dependencies = {
    ...Pet.dependencies,
    voidform: Voidform,
  };
  protected voidform!: Voidform;

  _pet = PETS.MINDBENDER;
  _mindbenders: any = {};

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(SPELLS.MINDBENDER_TALENT_SHADOW), this.onMindbenderSummon);
  }

  get suggestionStackThresholds() {
    return (mindbender: any) => ({
      actual: mindbender.voidformStacks,
      isLessThan: {
        minor: 15,
        average: 12,
        major: 10,
      },
      style: ThresholdStyle.NUMBER,
    });
  }

  get mindbenders() {
    return Object.keys(this._mindbenders).map(timestamp => this._mindbenders[timestamp]);
  }

  onMindbenderSummon(event: SummonEvent) {
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
