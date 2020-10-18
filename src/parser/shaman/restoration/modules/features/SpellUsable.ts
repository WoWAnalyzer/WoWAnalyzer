import SPELLS from 'common/SPELLS';
import Events, { DispelEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

class SpellUsable extends CoreSpellUsable {
  constructor(options: Options){
    super(options);
    this.addEventListener(Events.dispel.by(SELECTED_PLAYER).spell(SPELLS.PURIFY_SPIRIT), this.onDispel);
  }
  onDispel(event: DispelEvent) {
    super.beginCooldown(event.ability.guid, event);
  }

  beginCooldown(spellId: number, cooldownTriggerEvent: DispelEvent) {
    // Essentially having the purify spirit cast not be able to trigger the cooldown, the dispel event does it instead.
    if (spellId === SPELLS.PURIFY_SPIRIT.id) {
      return;
    }

    super.beginCooldown(spellId, cooldownTriggerEvent);
  }
}

export default SpellUsable;
