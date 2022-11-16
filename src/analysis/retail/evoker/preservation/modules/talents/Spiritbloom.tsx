import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber } from 'common/format';

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

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>Primary Target Healing: {formatNumber(this.spiritbloomInitialHealingDone)}</li>
            <li>Cleave Target Healing: {formatNumber(this.spiritbloomFirstSplitHealingDone)}</li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.SPIRITBLOOM_TALENT}>
          <ItemHealingDone
            amount={this.spiritbloomInitialHealingDone + this.spiritbloomFirstSplitHealingDone}
          />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default DreamBreath;
