import Analyzer, { Options } from 'parser/core/Analyzer';
import Mastery from 'analysis/retail/druid/restoration/modules/core/Mastery';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

/**
 * **Harmonius Blooming**
 * Spec Talent
 *
 * Lifebloom counts for (2 / 3) stacks of Mastery: Harmony
 */
class HarmoniusBlooming extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  ranks: number;

  constructor(options: Options) {
    super(options);
    this.ranks = this.selectedCombatant.getTalentRank(TALENTS_DRUID.HARMONIOUS_BLOOMING_TALENT);
    this.active = this.ranks > 0;
  }

  /**
   * The healing due only to the extra stacks from the talent.
   * Healing due to all the stacks is already added by the Mastery module,
   * so here we simply do the math to get the portion from only the extra stacks.
   */
  get extraStacksHealing() {
    const totalMasteryHealing =
      this.mastery.getMasteryHealing(SPELLS.LIFEBLOOM_HOT_HEAL.id) +
      this.mastery.getMasteryHealing(SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL.id);
    const portionFromExtraStacks = this.ranks / (this.ranks + 1);
    return totalMasteryHealing * portionFromExtraStacks;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(7)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the healing enabled by the extra {this.ranks}{' '}
            {this.ranks > 1 ? 'stacks' : 'stack'} of Mastery from Harmonius Blooming.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_DRUID.HARMONIOUS_BLOOMING_TALENT.id}>
          <ItemPercentHealingDone amount={this.extraStacksHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HarmoniusBlooming;
