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
  GOLDEN_OPPORTUNITY_PRESCIENCE_MULTIPLIER,
} from 'analysis/retail/evoker/augmentation/constants';
import StatTracker from 'parser/shared/modules/StatTracker';
import { InformationIcon } from 'interface/icons';

/**
 * Aug: Prescience lasts 15% longer.
 * Pres [NYI]: Echo copies 10% more healing.
 */
class GoldenOpportunity extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  };
  protected stats!: StatTracker;
  prescienceApplyTimestamps: Record<number, number> = {};
  prescienceTimestampExists: Record<number, boolean> = {};
  masteryAtPrescienceApplication: Record<number, number> = {};
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
    this.onPrescienceApply(event.targetID, event.timestamp);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.onPrescienceRemove(event.targetID, event.timestamp, false);
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    this.onPrescienceRemove(event.targetID, event.timestamp, false);
    this.onPrescienceApply(event.targetID, event.timestamp);
  }

  onFightEnd(event: FightEndEvent) {
    Object.keys(this.prescienceApplyTimestamps).forEach((targetID) => {
      this.onPrescienceRemove(Number(targetID), event.timestamp, true);
    });
  }

  onPrescienceApply(targetID: number, timestamp: number) {
    this.prescienceApplyTimestamps[targetID] = timestamp;
    this.prescienceTimestampExists[targetID] = true;
    this.masteryAtPrescienceApplication[targetID] = this.stats.currentMasteryPercentage;
  }

  onPrescienceRemove(targetID: number, timestamp: number, fightEndOrRefresh: boolean) {
    if (!this.prescienceTimestampExists[targetID] || !this.prescienceApplyTimestamps[targetID]) {
      return;
    }
    const prescienceDuration = (timestamp - this.prescienceApplyTimestamps[targetID]) / 1000;
    // This is the base Prescience duration before Golden Opportunity is factored in.
    const basePrescienceDuration =
      (PRESCIENCE_BASE_DURATION_MS *
        (1 + TIMEWALKER_BASE_EXTENSION + this.masteryAtPrescienceApplication[targetID])) /
      1000;
    if (!fightEndOrRefresh && prescienceDuration >= basePrescienceDuration * 1.05) {
      // Duration checked to ensure it wasn't removed early due to cancelaura or death.
      // Uses 1.05 to account for variations in timestamp, as this shouldn't occur often.
      this.totalPrescienceExtension +=
        prescienceDuration *
        (GOLDEN_OPPORTUNITY_PRESCIENCE_MULTIPLIER / (GOLDEN_OPPORTUNITY_PRESCIENCE_MULTIPLIER + 1));
    } else {
      // Prescience was removed early due to fight end, refresh cancelaura, or death.
      // Approximately calculate extension value based on Mastery at the time of application.
      const extensionValue = prescienceDuration - basePrescienceDuration;
      if (extensionValue > 0) {
        this.totalPrescienceExtension += extensionValue;
      }
    }
    this.prescienceTimestampExists[targetID] = false;
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
