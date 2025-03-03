import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import Events, {
  ApplyBuffEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { formatNumber } from 'common/format';
import {
  PRESCIENCE_BASE_DURATION_MS,
  TIMEWALKER_BASE_EXTENSION,
} from 'analysis/retail/evoker/augmentation/constants';
import { isGoldenOpportunityPrescience } from 'analysis/retail/evoker/augmentation/modules/normalizers/CastLinkNormalizer';
import StatTracker from 'parser/shared/modules/StatTracker';
import { InformationIcon } from 'interface/icons';

/**
 * Aug: Casting Prescience has a 20% chance to cause your next Prescience to last 100% longer.
 * Pres [NYI]: Casting Echo has a 20% chance to cause your next Echo to copy 100% more healing.
 */
class GoldenOpportunity extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  };
  protected stats!: StatTracker;
  goldenPrescienceApplyTimestamps: { [key: number]: number } = {};
  goldenPrescienceTimestampExists: { [key: number]: boolean } = {};
  masteryAtPrescienceApplication: { [key: number]: number } = {};
  totalPrescienceExtension = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.GOLDEN_OPPORTUNITY_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRESCIENCE_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.PRESCIENCE_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRESCIENCE_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (!isGoldenOpportunityPrescience(event)) {
      return;
    }
    this.onPrescienceApply(event.targetID, event.timestamp);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.onPrescienceRemove(event.targetID, event.timestamp, false);
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    this.onPrescienceRemove(event.targetID, event.timestamp, false);
    if (!isGoldenOpportunityPrescience(event)) {
      return;
    }
    this.onPrescienceApply(event.targetID, event.timestamp);
  }

  onFightEnd(event: FightEndEvent) {
    Object.keys(this.goldenPrescienceApplyTimestamps).forEach((targetID) => {
      this.onPrescienceRemove(Number(targetID), event.timestamp, true);
    });
  }

  onPrescienceApply(targetID: number, timestamp: number) {
    this.goldenPrescienceApplyTimestamps[targetID] = timestamp;
    this.goldenPrescienceTimestampExists[targetID] = true;
    this.masteryAtPrescienceApplication[targetID] = this.stats.currentMasteryPercentage;
  }

  onPrescienceRemove(targetID: number, timestamp: number, fightEnd: boolean) {
    if (
      !this.goldenPrescienceTimestampExists[targetID] ||
      !this.goldenPrescienceApplyTimestamps[targetID]
    ) {
      return;
    }
    const prescienceDuration = (timestamp - this.goldenPrescienceApplyTimestamps[targetID]) / 1000;
    const basePrescienceDuration =
      (PRESCIENCE_BASE_DURATION_MS *
        (1 + TIMEWALKER_BASE_EXTENSION + this.masteryAtPrescienceApplication[targetID])) /
      1000;
    if (!fightEnd && prescienceDuration >= basePrescienceDuration * 1.9) {
      // Use 1.9 as a threshold to account for variations in timestamps.
      this.totalPrescienceExtension += prescienceDuration / 2;
    } else {
      // Prescience was removed early due to fight end, cancelaura, or death.
      // Approximately calculate extension value based on Mastery at the time of application.
      const extensionValue = prescienceDuration - basePrescienceDuration;
      if (extensionValue > 0) {
        this.totalPrescienceExtension += extensionValue;
      }
    }
    this.goldenPrescienceTimestampExists[targetID] = false;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.GOLDEN_OPPORTUNITY_TALENT}>
          <div>
            <InformationIcon /> {formatNumber(this.totalPrescienceExtension)} sec
            <small> extra duration granted</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default GoldenOpportunity;
