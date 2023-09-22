import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

const BOOST_PER_REJUV = 0.08;
const RATE_MULT = 1.25; // Ticks every 4 seconds instead of every 5

/**
 * **Waking Dream**
 * Spec Talent
 *
 * Ysera's Gift now heals every 4 sec and its healing is increased by 8% for each of your active Rejuvenations.
 */
export default class WakingDream extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
  };

  hotTracker!: HotTrackerRestoDruid;

  totalHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.WAKING_DREAM_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.YSERAS_GIFT_SELF, SPELLS.YSERAS_GIFT_OTHERS]),
      this.onYserasGiftHeal,
    );
  }

  onYserasGiftHeal(event: HealEvent) {
    const rejuvCount =
      this.hotTracker.getHotCount(SPELLS.REJUVENATION.id) +
      this.hotTracker.getHotCount(SPELLS.REJUVENATION_GERMINATION.id);
    this.totalHealing += calculateEffectiveHealing(event, rejuvCount * BOOST_PER_REJUV) * RATE_MULT;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            This value is calculated from the healing boost due to Rejuvs out and estimates the
            effect of faster tick rate by assuming a linear increase in healing.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.WAKING_DREAM_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
