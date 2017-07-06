import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const debug = false;

const BASEMANA = 1100000;
const TWOPC_MANA_REDUCTION = .75;

class T20_2pc extends Module {
  manaSaved = 0;
  casts = 0;
  procs = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBuff(SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF.id);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.ENVELOPING_MISTS.id) {
      return;
    }
    if(this.owner.selectedCombatant.hasBuff(SPELLS.SURGE_OF_MISTS.id, event.timestamp)) {
      this.casts++;
      this.manaSaved += (BASEMANA * SPELLS.ENVELOPING_MISTS.manaPerc) * (1 - TWOPC_MANA_REDUCTION);
    }
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.SURGE_OF_MISTS.id) {
      return;
    }
    this.procs++;
  }

  on_toPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.SURGE_OF_MISTS.id) {
      return;
    }
    this.procs++;
  }

  on_finished() {
    if(debug) {
      console.log('T20 2pc Procs: ', this.procs);
      console.log('T20 2pc Casts: ', this.casts);
      console.log('T20 2pc Mana Saved: ', this.manaSaved);
    }
  }

}

export default T20_2pc;
