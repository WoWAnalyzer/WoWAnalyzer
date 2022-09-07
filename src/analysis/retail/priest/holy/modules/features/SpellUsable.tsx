import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbilityEvent, DispelEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.dispel.by(SELECTED_PLAYER), this.onDispel);
  }

  onDispel(event: DispelEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PURIFY.id) {
      super.beginCooldown(event, spellId);
    }
  }

  beginCooldown(cooldownTriggerEvent: AbilityEvent<any>, spellId: number) {
    // Essentially having the purify cast not be able to trigger the cooldown, the dispel event does it instead.
    if (spellId === SPELLS.PURIFY.id) {
      return;
    }

    super.beginCooldown(cooldownTriggerEvent, spellId);
  }
}

export default SpellUsable;
