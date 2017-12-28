import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import BlackoutCombo from './BlackoutCombo';

class KegSmash extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    boc: BlackoutCombo,
  }

  totalCasts = 0;
  totalHits = 0;
  bocHits = 0;

  _next_target = 0;

  _boc_buff_active = false;
  _boc_apply_to_ks = false;
  
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this._boc_buff_active = true;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this._boc_buff_active = true;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this._boc_buff_active = false;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if(SPELLS.KEG_SMASH.id === spellId) {
      this.totalCasts += 1;
      this._boc_apply_to_ks = this._boc_buff_active;
      this._next_target = event.targetID;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if(SPELLS.KEG_SMASH.id !== spellId || this._next_target !== event.targetID) {
      return;
    }
    this.totalHits += 1;
    if(this._boc_apply_to_ks) {
      this.bocHits += 1;
    }
  }
}

export default KegSmash;
