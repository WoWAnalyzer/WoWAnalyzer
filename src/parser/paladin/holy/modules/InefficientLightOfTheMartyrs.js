import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

class InefficientLightOfTheMartyrs extends Analyzer {
  constructor(options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_THE_MARTYR), this._onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_THE_MARTYR), this._onHeal);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_THE_MARTYR_DAMAGE_TAKEN), this._onDamage);
  }

  _cast = null;
  _onCast(event) {
    this._cast = event;
  }
  _heal = null;
  _onHeal(event) {
    this._heal = event;
  }
  _damage = null;
  _onDamage(event) {
    this._damage = event;
    this._check();
  }

  _check() {
    const cast = this._cast;
    const heal = this._heal;
    const damage = this._damage;
    if (!cast || !heal || !damage) {
      console.log(cast, heal, damage);
      throw new Error('Missing an event');
    }

    const healingDone = heal.amount + (heal.absorbed || 0);
    const damageTaken = damage.amount + (damage.absorbed || 0);

    const effectiveHealing = healingDone - damageTaken;
    if (effectiveHealing <= 0) {
      cast.meta = cast.meta || {};
      cast.meta.isInefficientCast = true;
      cast.meta.inefficientCastReason = 'This cast dealt more damage to you than it healed the target. If there is nothing to heal you, deal damage instead.';
    }

    this._heal = null;
    this._damage = null;
  }
}

export default InefficientLightOfTheMartyrs;
