import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { AnyEvent, DispelEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.dispel.by(SELECTED_PLAYER), this.onDispel);
  }

  onDispel(event: DispelEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PURIFY.id) {
      super.beginCooldown(spellId, event);
    }
  }

  beginCooldown(spellId: number, cooldownTriggerEvent: AnyEvent) {
    // Essentially having the purify cast not be able to trigger the cooldown, the dispel event does it instead.
    if (spellId === SPELLS.PURIFY.id) {
      return;
    }

    super.beginCooldown(spellId, cooldownTriggerEvent);
  }
}

export default SpellUsable;
