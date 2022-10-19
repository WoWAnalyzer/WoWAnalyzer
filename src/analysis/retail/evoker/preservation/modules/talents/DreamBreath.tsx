import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

class DreamBreath extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  breathHealingDone = 0;
  breathDotHealingDone = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.DREAM_BREATH, SPELLS.DREAM_BREATH_ECHO]),
      this.onHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_BREATH),
      this.onDotHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.breathHealingDone += event.amount + (event.absorbed || 0);
  }

  onDotHeal(event: HealEvent) {
    this.breathDotHealingDone += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.DREAM_BREATH.id}>
          <ItemPercentHealingDone amount={this.breathHealingDone} />
          <ItemPercentHealingDone amount={this.breathDotHealingDone} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DreamBreath;
