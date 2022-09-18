import * as SPELLS from 'analysis/classic/priest/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

// Example log: /report/83DzPYKTwyQA9gXx/16-Normal+Felmyst+-+Kill+(3:07)/Mananangal/disc/statistics
class DivineAegis extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  get effectiveDamage() {
    return this.abilityTracker.getAbility(SPELLS.REFLECTIVE_SHIELD).damageEffective;
  }

  statistic() {
    if (this.effectiveDamage === 0) {
      return null;
    }

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.REFLECTIVE_SHIELD}>
          <ItemDamageDone amount={this.effectiveDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DivineAegis;
