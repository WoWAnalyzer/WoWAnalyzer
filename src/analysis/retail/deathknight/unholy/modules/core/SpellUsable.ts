import TALENTS from 'common/TALENTS/deathknight';
import { Options } from 'parser/core/Analyzer';
import { AbilityEvent, CastEvent, EventType, FilterCooldownInfoEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  private readonly putrefyMaxConsumesPerCast: number;

  constructor(options: Options) {
    super(options);
    this.putrefyMaxConsumesPerCast = this.selectedCombatant.hasTalent(TALENTS.PUTRID_ECHOES_TALENT)
      ? 2
      : 1;
  }

  protected onCast(event: CastEvent | FilterCooldownInfoEvent) {
    if (event.type === EventType.Cast && event.ability.guid === TALENTS.SOUL_REAPER_TALENT.id) {
      this.beginCooldown(event, TALENTS.PUTREFY_TALENT.id);
    }

    super.onCast(event);
  }

  beginCooldown(
    triggeringEvent: AbilityEvent<EventType>,
    spellId: number = triggeringEvent.ability.guid,
  ) {
    if (spellId !== TALENTS.PUTREFY_TALENT.id) {
      super.beginCooldown(triggeringEvent, spellId);
      return;
    }

    const isSoulReaperTrigger = triggeringEvent.ability.guid === TALENTS.SOUL_REAPER_TALENT.id;
    const maxConsumesPerTrigger = isSoulReaperTrigger ? 2 : this.putrefyMaxConsumesPerCast;
    const chargesToConsume = Math.min(maxConsumesPerTrigger, this.chargesAvailable(spellId));

    for (let i = 0; i < chargesToConsume; i += 1) {
      super.beginCooldown(triggeringEvent, spellId);
    }
  }
}

export default SpellUsable;
