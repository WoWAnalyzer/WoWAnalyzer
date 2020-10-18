import SPELLS from 'common/SPELLS';

import CoreAbilityTracker, { TrackedAbility } from 'parser/shared/modules/AbilityTracker';
import { Ability, CastEvent } from 'parser/core/Events';

interface TrackedDisciplineAbility extends TrackedAbility {
  raptureCasts?: number;
}

class AbilityTracker extends CoreAbilityTracker {
  getAbility(spellId: number, abilityInfo: Ability | null = null): TrackedDisciplineAbility {
    if (
      spellId === SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id ||
      spellId === SPELLS.LIGHTSPAWN.id
    ) {
      return super.getAbility(SPELLS.SHADOWFIEND.id, abilityInfo);
    }
    return super.getAbility(spellId, abilityInfo);
  }

  onCast(event: CastEvent) {
    super.onCast(event);
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    if (spellId === SPELLS.POWER_WORD_SHIELD.id) {
      const hasRapture = this.selectedCombatant.hasBuff(SPELLS.RAPTURE.id, event.timestamp);

      if (hasRapture) {
        cast.raptureCasts = (cast.raptureCasts || 0) + 1;
      }
    }
  }
}

export default AbilityTracker;
