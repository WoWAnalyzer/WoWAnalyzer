import {
  AbilityEvent,
  AnyEvent,
  EventType,
  GetRelatedEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import { EnhancementEventLinks } from '../../constants';

class SpellUsable extends CoreSpellUsable.withDependencies({
  ...CoreSpellUsable.dependencies,
}) {
  beginCooldown(
    triggeringEvent: AbilityEvent<any>,
    spellId: number = triggeringEvent.ability.guid,
  ) {
    if (triggeringEvent.type === EventType.FreeCast) {
      return;
    }

    if (
      spellId === TALENTS.CRASH_LIGHTNING_TALENT.id &&
      GetRelatedEvent<RemoveBuffEvent | RemoveBuffStackEvent>(
        triggeringEvent,
        EnhancementEventLinks.STORM_UNLEASHED_LINK,
        (e: AnyEvent) =>
          (e.type === EventType.RemoveBuff || e.type === EventType.RemoveBuffStack) &&
          e.ability.guid === SPELLS.STORM_UNLEASHED_BUFF.id,
      )
    ) {
      // Storm Unleashed consumes the proc to allow a Crash Lightning that bypasses cooldown.
      // Do not start cooldown and do not generate cooldown error annotations.
      return;
    }

    super.beginCooldown(triggeringEvent, spellId);
  }

  public isAvailable(spellId: number): boolean {
    switch (spellId) {
      case SPELLS.STORMSTRIKE.id:
        return (
          !this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT) &&
          super.isAvailable(spellId)
        );
      case SPELLS.WINDSTRIKE_CAST.id:
        return (
          this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT) &&
          super.isAvailable(spellId)
        );
      default:
        return super.isAvailable(spellId);
    }
  }
}

export default SpellUsable;
