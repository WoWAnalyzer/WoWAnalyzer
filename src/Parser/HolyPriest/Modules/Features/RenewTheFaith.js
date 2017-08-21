import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class RenewTheFaith extends Module {
  _validPoMBefore = 0;
  poms = 0;
  healing = 0;
  overhealing = 0;

  on_initialized() {
    this._maxHymnDuration = 8 / (1 + this.owner.selectedCombatant.hastePercentage);
    this.active = this.owner.selectedCombatant.traitsBySpellId[SPELLS.RENEW_THE_FAITH_TRAIT.id] > 0;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DIVINE_HYMN_CAST.id) {
      this._validPoMBefore = event.timestamp + this._maxHymnDuration * 1000;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRAYER_OF_MENDING_HEAL.id && spellId !== SPELLS.HOLY_MENDING_TRAIT.id) { return; }
    if (event.timestamp < this._validPoMBefore) {
      if (spellId === SPELLS.PRAYER_OF_MENDING_HEAL.id) { this.poms += 1; }
      this.healing += event.amount;
      this.overhealing += event.overheal || 0;
    }
  }
}


export default RenewTheFaith;
