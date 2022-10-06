import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import { Attribution } from 'parser/shared/modules/HotTracker';
import {
  getDirectHeal,
  getHardcast,
} from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { buffedByClearcast } from 'analysis/retail/druid/restoration/normalizers/ClearcastingNormalizer';

const REGROWTH_BOOST = 0.3;

/**
 * **Flash of Clarity**
 * Spec Talent Tier 3
 *
 * Clearcast Regrowths heal for an additional 30%.
 */
class FlashOfClarity extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
  };
  protected hotTracker!: HotTrackerRestoDruid;

  hotBoostAttribution: Attribution = HotTrackerRestoDruid.getNewAttribution('FoC Regrowth');
  directBoostHealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.FLASH_OF_CLARITY_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onRegrowthApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onRegrowthApply,
    );
  }

  onRegrowthApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    const hardcast = getHardcast(event);
    if (!hardcast || !buffedByClearcast(hardcast)) {
      return; // only apply boost to casts that actually buffed by clearcast
    }

    this.hotTracker.addBoostFromApply(this.hotBoostAttribution, REGROWTH_BOOST, event);
    const directHeal = getDirectHeal(hardcast);
    if (directHeal) {
      this.directBoostHealing += calculateEffectiveHealing(directHeal, REGROWTH_BOOST);
    }
  }

  get totalHealing(): number {
    return this.directBoostHealing + this.hotBoostAttribution.healing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS_DRUID.FLASH_OF_CLARITY_TALENT.id}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FlashOfClarity;
