import SPELLS from 'common/SPELLS';

import CoreHaste from 'Parser/Core/Modules/Haste';

const debug = false;

class Haste extends CoreHaste {
  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LINGERING_INSANITY.id) {
      this._applyHasteLoss(event, this._highestVoidformStack * 0.01);
      debug && console.log(`ABC: Current haste: ${this.currentHaste} (lost ${0.01 * this._highestVoidformStack} from VOIDFORM_BUFF)`);

      this._highestLingeringStack = this._highestVoidformStack;
      this._applyHasteGain(event, this._highestLingeringStack * 0.01);

      this._highestVoidformStack = 0;

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${0.01 * this._highestLingeringStack} from LINGERING_INSANITY)`);
      return;
    }

    if (spellId === SPELLS.VOID_TORRENT.id) {
      return;
    }

    super.on_toPlayer_applybuff && super.on_toPlayer_applybuff(event);
  }

  on_toPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOIDFORM_BUFF.id) {
      this._applyHasteLoss(event, this._highestVoidformStack * 0.01);
      this._highestVoidformStack = event.stack;
      this._applyHasteGain(event, this._highestVoidformStack * 0.01);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${0.01 * this._highestVoidformStack} from VOIDFORM_BUFF)`);
    }

    super.on_toPlayer_applybuffstack && super.on_toPlayer_applybuffstack(event);
  }

  on_toPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LINGERING_INSANITY.id) {
      this._applyHasteLoss(event, this._highestLingeringStack * 0.01);
      this._highestLingeringStack = event.stack;
      this._applyHasteGain(event, this._highestLingeringStack * 0.01);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (lost ${0.02} from LINGERING_INSANITY)`);
    }

    super.on_toPlayer_removebuffstack && super.on_toPlayer_removebuffstack(event);
  }
}

export default Haste;
