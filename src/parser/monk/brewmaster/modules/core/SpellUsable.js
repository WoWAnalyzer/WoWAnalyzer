import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

const BREWS = [SPELLS.IRONSKIN_BREW.id, SPELLS.PURIFYING_BREW.id];

export default class SpellUsable extends CoreSpellUsable {
  _hasSNC = false;
  _SNCResets = 0;

  _lastISBCast = null;

  constructor(...args) {
    super(...args);
    this._hasSNC = this.selectedCombatant.hasTrait(SPELLS.STRAIGHT_NO_CHASER.id);
  }

  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }

    if (event.ability.guid !== SPELLS.IRONSKIN_BREW.id) {
      return;
    }

    this._lastISBCast = event.timestamp;
  }

  beginCooldown(spellId, ...args) {
    if (!this._hasSNC || !BREWS.includes(spellId) || this.isAvailable(spellId)) {
      return super.beginCooldown(spellId, ...args);
    }

    // we have no way of knowing which ISB cast triggered the free
    // charge, so we're just going to use the most recent one.
    this.endCooldown(spellId, false, this._lastISBCast);
    this._SNCResets += 1;
    return super.beginCooldown(spellId, ...args);
  }
}
