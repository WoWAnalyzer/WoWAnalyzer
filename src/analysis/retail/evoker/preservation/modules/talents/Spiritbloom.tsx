import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { HealEvent } from 'parser/core/Events';
import { TALENTS_EVOKER } from 'common/TALENTS';

class DreamBreath extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  spiritbloomInitialHealingDone = 0;
  spiritbloomFirstSplitHealingDone = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.SPIRITBLOOM_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SPIRITBLOOM), this.onHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SPIRITBLOOM_SPLIT),
      this.onSplitHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.spiritbloomInitialHealingDone += event.amount + (event.absorbed || 0);
  }

  onSplitHeal(event: HealEvent) {
    this.spiritbloomFirstSplitHealingDone += event.amount + (event.absorbed || 0);
  }
}

export default DreamBreath;
