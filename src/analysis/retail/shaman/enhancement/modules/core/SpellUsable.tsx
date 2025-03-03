import { AbilityEvent, EventType } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  beginCooldown(triggeringEvent: AbilityEvent<any>, spellId: number) {
    if (triggeringEvent.type === EventType.FreeCast) {
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
