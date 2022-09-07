import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DispelEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.dispel.by(SELECTED_PLAYER).spell(SPELLS.PURIFY_SPIRIT),
      this.onDispel,
    );
  }
  onDispel(event: DispelEvent) {
    super.beginCooldown(event);
  }

  beginCooldown(cooldownTriggerEvent: DispelEvent, spellId: number) {
    // Essentially having the purify spirit cast not be able to trigger the cooldown, the dispel event does it instead.
    if (spellId === SPELLS.PURIFY_SPIRIT.id) {
      return;
    }

    super.beginCooldown(cooldownTriggerEvent, spellId);
  }
}

export default SpellUsable;
