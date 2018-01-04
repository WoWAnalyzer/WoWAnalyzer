import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.PENANCE.id) {
      return;
    }
    super.on_byPlayer_cast(event);
  }
  on_toPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.SPEED_OF_THE_PIOUS.id) {
      this.beginCooldown(SPELLS.PENANCE.id, event.timestamp);
    }
  }
}

export default SpellUsable;
