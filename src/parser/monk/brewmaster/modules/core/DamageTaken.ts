import CoreDamageTaken from 'parser/shared/modules/throughput/DamageTaken';
import SPELLS from 'common/SPELLS';
import Events, { AbsorbedEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

class DamageTaken extends CoreDamageTaken {
  _staggeredDamage: { [guid: number]: number } = {};

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.STAGGER), this.onToPlayerAbsorbed);
  }

  onToPlayerAbsorbed(event: AbsorbedEvent) {
    // The `damage` events of Brewmaster Monks always includes the amount staggered as "absorbed" damage,
    // but this absorbed damage might also include absorbs received from other people (e.g. Power Word:
    // Shield) so we can't just ignore it completely.Luckily the logs give us another event that shows
    // just the damage staggered, namely an `absorbed` event by the Stagger spell. We can safely use this
    // to reduce the damage taken as it can only be caused by this. If Stagger gets absorbed by a shield
    // such as Power Word: Shield, it will trigger an `absorbed` event with as spell PW:S, NOT Stagger,
    // so this also works nicely with external absorbs.

    this._subtractDamage(event, 0, event.amount, 0, 0, event.extraAbility);
    if (this._staggeredDamage[event.extraAbility.guid] === undefined) {
      this._staggeredDamage[event.extraAbility.guid] = 0;
    }
    this._staggeredDamage[event.extraAbility.guid] += event.amount;
  }

  staggeredByAbility(guid: number) {
    return this._staggeredDamage[guid] !== undefined ? this._staggeredDamage[guid] : 0;
  }
}

export default DamageTaken;
