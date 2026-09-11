import Analyzer, { Options } from 'parser/core/Analyzer';
import Mastery from 'analysis/retail/druid/restoration/modules/core/Mastery';
import { TALENTS_DRUID } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { HARMONIUS_BLOOMING_EXTRA_STACKS } from 'analysis/retail/druid/restoration/constants';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import { SpellLink } from 'interface';

/**
 *
 * **Harmonius Blooming**
 * Spec Talent Tier 10
 *
 * Lifebloom counts for 3 stacks of Mastery: Harmony
 */
class HarmoniusBlooming extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.HARMONIOUS_BLOOMING_TALENT);
  }

  /**
   * Extra Lifebloom stacks on mastery-affected heals, including Everbloom splash
   * which inherits the bloom target's mastery (no splash-target double-dip).
   */
  get extraStacksHealing() {
    return this.mastery.getHarmoniusBloomingHealing();
  }

  get extraStacksOverhealing() {
    return this.mastery.getHarmoniusBloomingOverhealing();
  }

  statistic() {
    const everbloomSplashHealing = this.mastery.getHarmoniusBloomingEverbloomSplashHealing();

    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(10)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the healing enabled by the extra {HARMONIUS_BLOOMING_EXTRA_STACKS} stacks of
            Mastery from Harmonius Blooming.
            {everbloomSplashHealing > 0 && (
              <>
                <br />
                Includes <strong>
                  {this.owner.formatItemHealingDone(everbloomSplashHealing)}
                </strong>{' '}
                from <SpellLink spell={TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT} /> splash
                inheriting the amplified Lifebloom blooms.
              </>
            )}
            <br />
            <strong>
              Overhealing: {formatOverhealing(this.extraStacksOverhealing, this.extraStacksHealing)}
            </strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.HARMONIOUS_BLOOMING_TALENT}>
          <ItemPercentHealingDone amount={this.extraStacksHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HarmoniusBlooming;
