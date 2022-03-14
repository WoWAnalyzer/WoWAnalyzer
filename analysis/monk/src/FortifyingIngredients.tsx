import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class FortifyingIngredients extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
  };

  protected healingDone!: HealingDone;

  /**
   * Whenever you cast fort brew you gain a shield for x% of your hp
   */
  constructor(options: Options) {
    super(options);

    const conduitRank = this.selectedCombatant.conduitRankBySpellID(
      SPELLS.FORTIFYING_INGREDIENTS.id,
    );
    if (!conduitRank) {
      this.active = false;
      return;
    }
  }

  statistic() {
    // This is silly work around till I can get around to fixing the whole `HealingDone` library to actually work logically with absorbs
    const shield = this.healingDone.byAbility(SPELLS.FORTIFYING_INGREDIENTS_SHIELD.id).regular;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spellId={SPELLS.FORTIFYING_INGREDIENTS.id}>
          <ItemHealingDone amount={shield} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FortifyingIngredients;
