import * as SPELLS from 'analysis/classic/priest/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

class DivineAegis extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  get effectiveShielding(){
    return this.abilityTracker.getAbility(SPELLS.DIVINE_AEGIS).healingEffective;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.DIVINE_AEGIS}>
          <ItemHealingDone amount={this.effectiveShielding} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DivineAegis;
