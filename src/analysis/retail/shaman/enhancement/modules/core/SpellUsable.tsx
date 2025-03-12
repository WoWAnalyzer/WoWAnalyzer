import { AbilityEvent, CastEvent, EventType } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';
import SpellLink from 'interface/SpellLink';

const RESET_BUFFER_MS = 100;

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

    switch (spellId) {
      case TALENTS.SUNDERING_TALENT.id: {
        let isAvailable = super.isAvailable(spellId);
        if (this.selectedCombatant.hasTalent(TALENTS.MOLTEN_THUNDER_TALENT) && !isAvailable) {
          const cdInfo = this._currentCooldowns[spellId];
          this.endCooldown(spellId, cdInfo.overallStart + RESET_BUFFER_MS);
          addEnhancedCastReason(
            triggeringEvent as CastEvent,
            <>
              <SpellLink spell={TALENTS.SUNDERING_TALENT} /> was reset by{' '}
              <SpellLink spell={TALENTS.MOLTEN_THUNDER_TALENT} />
            </>,
          );
          isAvailable = true;
        }
      }
    }
    super.beginCooldown(triggeringEvent, spellId);
  }

  public isAvailable(spellId: number): boolean {
    switch (spellId) {
      case SPELLS.STORMSTRIKE_CAST.id:
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
