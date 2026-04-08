import Events, { ResourceChangeEvent, CastEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import { TALENTS_ROGUE } from 'common/TALENTS/rogue';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

// Crack Shot talent gives Between The Eyes no cooldown whilst in stealth
// Also resets the cooldown when entering stealth
class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_ROGUE.ACE_UP_YOUR_SLEEVE_TALENT);

    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.bteReset);
  }

  private bteReset(event: ResourceChangeEvent) {
    if (
      event.ability.guid == TALENTS_ROGUE.ACE_UP_YOUR_SLEEVE_TALENT.id ||
      event.ability.guid == TALENTS_ROGUE.GRAVEDIGGER_3_OUTLAW_TALENT.id
    ) {
      super.endCooldown(SPELLS.BETWEEN_THE_EYES.id, event.timestamp);
    }
  }

  beginCooldown(cooldownTriggerEvent: CastEvent, _spellId: number) {
    const spellId = cooldownTriggerEvent.ability.guid;

    if (spellId === SPELLS.BETWEEN_THE_EYES.id) {
      return;
    }

    super.beginCooldown(cooldownTriggerEvent, spellId);
  }
}

export default SpellUsable;
