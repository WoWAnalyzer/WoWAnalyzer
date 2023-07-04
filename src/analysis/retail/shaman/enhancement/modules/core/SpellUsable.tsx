import { AbilityEvent, EventType } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';

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

  isAvailable(spellId: number): boolean {
    const hasAscendance = this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id);
    if (spellId === SPELLS.WINDSTRIKE_CAST.id && !hasAscendance) {
      return false;
    }
    if (spellId === TALENTS.STORMSTRIKE_TALENT.id && hasAscendance) {
      return false;
    }
    return super.isAvailable(spellId);
  }
}

export default SpellUsable;
