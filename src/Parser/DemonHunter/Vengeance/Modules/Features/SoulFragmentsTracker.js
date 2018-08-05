import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import SPELLS from 'common/SPELLS/index';

const COOLDOWN_REDUCTION_MS = 500;

class SoulFragmentsTracker extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  totalCooldownReductionWasted = 0;
  totalCooldownReduction = 0;

  soulsGenerated = 0;
  soulsWasted = 0;
  soulsSpent = 0;
  currentSouls = 0;

  soulsConsumedBySpell = [];

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SOUL_FRAGMENT.id) {
      this.soulsGenerated += 1;
      if (this.currentSouls < 5) {
        this.currentSouls += 1;
      } else {
        this.soulsWasted += 1;
      }
    }
  }

  on_byPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SOUL_FRAGMENT_STACK.id) {
      this.soulsSpent += 1;
      this.currentSouls -= 1;
    }
    if (!this.selectedCombatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id)){
      return;
    }
    if (!this.spellUsable.isOnCooldown(SPELLS.DEMON_SPIKES.id)){
      this.totalCooldownReductionWasted += COOLDOWN_REDUCTION_MS;
      console.log("TEST ", this.totalCooldownReductionWasted);
    } else {
      const effectiveReduction = this.spellUsable.reduceCooldown(SPELLS.DEMON_SPIKES.id, COOLDOWN_REDUCTION_MS);
      this.totalCooldownReduction += effectiveReduction;
      this.totalCooldownReductionWasted += COOLDOWN_REDUCTION_MS - effectiveReduction;
    }
  }

  get FTDReduction(){
    return this.totalCooldownReduction;
  }

  get FTDReductionWasted(){
    return this.totalCooldownReductionWasted;
  }


}

export default SoulFragmentsTracker;
