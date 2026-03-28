import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import { BASE_RENEW_DURATION, PREEMPTIVE_CARE_EXTENSION_PERCENT } from '../../../constants';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

interface RenewApplication {
  start: number;
  originalEnd: number;
  extendedEnd: number;
  targetKey: string;
}

/**
 * Preemptive Care (Oracle)
 * Increases the duration of your Renew by 40%.
 */

class PreemptiveCareHoly extends Analyzer {
  private activeRenews = new Map<string, RenewApplication>();
  private healingAttributed = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PREEMPTIVE_CARE_TALENT);

    if (!this.active) return;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEW_HEAL),
      this.onRenewApplyEvent,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.RENEW_HEAL),
      this.onRenewRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RENEW_HEAL),
      this.onRenewRemove,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEW_HEAL),
      this.onRenewHeal,
    );
  }

  private getTargetKey(targetID: number, targetInstance?: number): string {
    return encodeTargetString(targetID, targetInstance);
  }

  private onRenewApply(timestamp: number, targetID: number, targetInstance?: number) {
    const targetKey = this.getTargetKey(targetID, targetInstance);
    const baseDurationMs = BASE_RENEW_DURATION * 1000;
    const extraMs = baseDurationMs * PREEMPTIVE_CARE_EXTENSION_PERCENT;

    this.activeRenews.set(targetKey, {
      start: timestamp,
      originalEnd: timestamp + baseDurationMs,
      extendedEnd: timestamp + baseDurationMs + extraMs,
      targetKey,
    });
  }

  private onRenewApplyEvent(event: ApplyBuffEvent) {
    this.onRenewApply(event.timestamp, event.targetID, event.targetInstance);
  }

  private onRenewRefresh(event: RefreshBuffEvent) {
    const targetKey = this.getTargetKey(event.targetID, event.targetInstance);
    const existing = this.activeRenews.get(targetKey);
    const baseDurationMs = BASE_RENEW_DURATION * 1000;
    const extraMs = baseDurationMs * PREEMPTIVE_CARE_EXTENSION_PERCENT;

    if (existing) {
      existing.start = event.timestamp;
      existing.originalEnd = event.timestamp + baseDurationMs;
      existing.extendedEnd = event.timestamp + baseDurationMs + extraMs;
    } else {
      this.onRenewApply(event.timestamp, event.targetID, event.targetInstance);
    }
  }

  private onRenewRemove(event: RemoveBuffEvent) {
    const targetKey = this.getTargetKey(event.targetID, event.targetInstance);
    this.activeRenews.delete(targetKey);
  }

  private onRenewHeal(event: HealEvent) {
    const targetKey = this.getTargetKey(event.targetID, event.targetInstance);
    const app = this.activeRenews.get(targetKey);
    if (!app) return;

    // Attribute healing that occurs after the normal duration but before the extended end
    if (event.timestamp > app.originalEnd && event.timestamp <= app.extendedEnd) {
      this.healingAttributed += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip="Healing contributed by the additional 40% duration of Renew."
      >
        <TalentSpellText talent={TALENTS_PRIEST.PREEMPTIVE_CARE_TALENT}>
          <ItemPercentHealingDone amount={this.healingAttributed} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PreemptiveCareHoly;
