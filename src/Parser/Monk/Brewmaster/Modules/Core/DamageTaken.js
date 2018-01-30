import CoreDamageTaken from 'Parser/Core/Modules/DamageTaken';
import SPELLS from 'common/SPELLS';

class DamageTaken extends CoreDamageTaken {
  _staggeredDamage = {};
  on_toPlayer_absorbed(event) {
    // The `damage` events of Brewmaster Monks always includes the amount staggered as "absorbed" damage,
    // but this absorbed damage might also include absorbs received from other people (e.g. Power Word:
    // Shield) so we can't just ignore it completely.Luckily the logs give us another event that shows
    // just the damage staggered, namely an `absorbed` event by the Stagger spell. We can safely use this
    // to reduce the damage taken as it can only be caused by this. If Stagger gets absorbed by a shield
    // such as Power Word: Shield, it will trigger an `absorbed` event with as spell PW:S, NOT Stagger,
    // so this also works nicely with external absorbs.

    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STAGGER.id) {
      return;
    }
    this._subtractDamage(event.extraAbility, 0, event.amount, 0);
    if(!(event.extraAbility.guid in this._staggeredDamage)) {
      this._staggeredDamage[event.extraAbility.guid] = 0;
    }
    this._staggeredDamage[event.extraAbility.guid] += event.amount;
  }

  staggeredByAbility(guid) {
    return (guid in this._staggeredDamage) ? this._staggeredDamage[guid] : 0;
  }
}

export default DamageTaken;
