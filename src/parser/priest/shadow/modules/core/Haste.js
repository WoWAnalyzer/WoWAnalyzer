import SPELLS from 'common/SPELLS';
import { formatMilliseconds, formatPercentage } from 'common/format';
import CoreHaste from 'parser/shared/modules/Haste';

const debug = false;

const VOIDFORM_HASTE_PER_STACK = 0.01;

class Haste extends CoreHaste {
  _highestVoidformStack = 0;

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.VOIDFORM_BUFF.id) {
      this._highestVoidformStack = 1;
      this._applyHasteGain(event, this._highestVoidformStack * VOIDFORM_HASTE_PER_STACK);
      debug && console.log(`ABC: Current haste: ${this.current} (gained ${VOIDFORM_HASTE_PER_STACK * this._highestVoidformStack} from VOIDFORM_BUFF)`, event.timestamp);
      return;
    }

    // if (spellId === SPELLS.VOID_TORRENT.id) {
    //   return;
    // }

    super.on_toPlayer_applybuff && super.on_toPlayer_applybuff(event);
  }

  on_toPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOIDFORM_BUFF.id) {
      const oldStacks = this._highestVoidformStack;
      const newStacks = event.stack;
      this._highestVoidformStack = newStacks;

      // Haste stacks are additive, so at 5 stacks with 3% per you'd be at 15%, 6 stacks = 18%. This means the only right way to add a Haste stack is to reset to Haste without the old total and then add the new total Haste again.
      // 1. Calculate the total Haste percentage without the buff
      const baseHaste = this.constructor.removeHaste(this.current, oldStacks * VOIDFORM_HASTE_PER_STACK);
      // 2. Calculate the new total Haste percentage with the Haste from the new amount of stacks
      const newHastePercentage = this.constructor.addHaste(baseHaste, newStacks * VOIDFORM_HASTE_PER_STACK);

      this._setHaste(event, newHastePercentage);

      if (debug) {
        const fightDuration = formatMilliseconds(this.owner.fightDuration);
        console.log(`%c${[
          'Haste:',
          fightDuration,
          `+0.01 from VOIDFORM_BUFF (now ${event.stack} stacks)`,
          'current:', `${formatPercentage(this.current)}%`,
        ].join('  ')}`, `color: green`);
      }
    }

    super.on_toPlayer_applybuffstack && super.on_toPlayer_applybuffstack(event);
  }

  on_toPlayer_removebuff(event) {
    super.on_toPlayer_removebuff && super.on_toPlayer_removebuff(event);
  }

  on_toPlayer_removebuffstack(event) {
    super.on_toPlayer_removebuffstack && super.on_toPlayer_removebuffstack(event);
  }
}

export default Haste;
