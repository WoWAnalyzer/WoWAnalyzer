import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

const DURABILITY_OF_NATURE_DURATION_INCREASE = 0.2;
/** Extra duration share of observed GG healing: 1.6 / 9.6 */
const DURABILITY_OF_NATURE_HEALING_SHARE =
  DURABILITY_OF_NATURE_DURATION_INCREASE / (1 + DURABILITY_OF_NATURE_DURATION_INCREASE);

/**
 * **Durability of Nature**
 * Hero Talent - Keeper of the Grove
 *
 * Grove Guardians last 20% longer.
 */
export default class DurabilityOfNature extends Analyzer {
  totalHealing = 0;
  totalOverhealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.DURABILITY_OF_NATURE_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER_PET)
        .spell([SPELLS.GROVE_GUARDIANS_SWIFTMEND, SPELLS.GROVE_GUARDIANS_NOURISH]),
      this.onHeal,
    );
  }

  private onHeal(event: HealEvent) {
    this.totalHealing += calculateEffectiveHealing(event, DURABILITY_OF_NATURE_DURATION_INCREASE);
    this.totalOverhealing += calculateOverhealing(event, DURABILITY_OF_NATURE_DURATION_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            Grove Guardians last 8s baseline and 9.6s with this talent. Attributes{' '}
            {(DURABILITY_OF_NATURE_HEALING_SHARE * 100).toFixed(1)}% of observed Grove Guardian
            healing as coming from the extra duration.
            <br />
            <strong>
              Overhealing: {formatOverhealing(this.totalOverhealing, this.totalHealing)}
            </strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.DURABILITY_OF_NATURE_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
