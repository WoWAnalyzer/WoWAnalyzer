import { Ability } from 'parser/core/Events';
import AbilityTracker, { TrackedAbility } from 'parser/shared/modules/AbilityTracker';

export interface TrackedRestoShamanAbility extends TrackedAbility {
  healingTwHits?: number;
}

class RestorationAbilityTracker extends AbilityTracker {
  getAbility(spellId: number, abilityInfo: Ability | null = null): TrackedRestoShamanAbility {
    return super.getAbility(spellId, abilityInfo);
  }
}

export default RestorationAbilityTracker;
