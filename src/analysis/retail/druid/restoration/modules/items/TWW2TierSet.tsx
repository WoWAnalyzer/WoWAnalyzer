import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TIERS } from 'game/TIERS';
import Events, {
  ApplyBuffEvent,
  FightEndEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  TargettedEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { effectiveHealing } from 'parser/shared/modules/HealingValue';
import {
  isHotFromInsurance,
  isInsuranceFromBloom,
} from 'analysis/retail/druid/restoration/normalizers/TWW2TierSetNormalizer';
import HotAttributor from 'analysis/retail/druid/restoration/modules/core/hottracking/HotAttributor';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import ItemSetLink from 'interface/ItemSetLink';
import { DRUID_TWW2_ID } from 'common/ITEMS';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';

const DEBUG = false;

const PROCCED_HOTS = [
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
  SPELLS.REGROWTH,
  SPELLS.WILD_GROWTH,
];

const RANDOM_INSURANCE_DURATION = 15_000;
const BUFFER = 1_000;

/**
 * **Roots of Reclaiming Blight**
 * Liberation of Undermine (TWW S2) Tier Set
 *
 * 2 pc - Your healing spells have a chance to apply Insurance! to their targets that heals them for
 * X over 15 sec. Insurance! is consumed if an ally drops below 40% health to heal them for X.
 *
 * 4pc - Lifebloom's bloom has a 30% chance to apply Insurance! to its target for 10 sec.
 * When Insurance! is consumed or removed, it leaves a missing Rejuvenation, Regrowth, or
 * Wild Growth heal over time effect for 15 sec on its target.
 */
export default class TWW2TierSet extends Analyzer.withDependencies({
  hotAttributor: HotAttributor,
}) {
  has4pc: boolean;

  /** Stats for random insurance procs (from 2pc) */
  randomInsuranceStats: InsuranceStats = {
    hotUptime: 0,
    hotHealing: 0,
    procCount: 0,
    procHealing: 0,
  };
  /** Stats for bloom insurance procs (from 4pc) */
  bloomInsuranceStats: InsuranceStats = {
    hotUptime: 0,
    hotHealing: 0,
    procCount: 0,
    procHealing: 0,
  };

  /** Info about applied Insurance HoT, indexed by targetID */
  insuranceInfoByTargetId: Map<number, InsApplyInfo> = new Map<number, InsApplyInfo>();

  proccedRejuvs = 0;
  proccedRegrowths = 0;
  proccedWgs = 0;
  // procced hot healing tracked through HotAttributor

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has2PieceByTier(TIERS.TWW2);
    this.has4pc = this.selectedCombatant.has4PieceByTier(TIERS.TWW2);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.INSURANCE_HOT_DRUID),
      this.onInsuranceHotHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.INSURANCE_PROC_DRUID),
      this.onInsuranceProcHeal,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(PROCCED_HOTS),
      this.onApplyProccedHot,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(PROCCED_HOTS),
      this.onApplyProccedHot,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INSURANCE_HOT_DRUID),
      this.onInsuranceApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.INSURANCE_HOT_DRUID),
      this.onInsuranceRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INSURANCE_HOT_DRUID),
      this.onInsuranceRemove,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onInsuranceHotHeal(event: HealEvent) {
    const stats = this.isFrom4Pc(event) ? this.bloomInsuranceStats : this.randomInsuranceStats;
    stats.hotHealing += effectiveHealing(event);

    const insInfo = this.insuranceInfoByTargetId.get(event.targetID);
    if (insInfo) {
      insInfo.lastHealTimestamp = event.timestamp;
    }
  }

  onInsuranceProcHeal(event: HealEvent) {
    const stats = this.isFrom4Pc(event) ? this.bloomInsuranceStats : this.randomInsuranceStats;
    DEBUG &&
      console.log(
        `${this.owner.formatTimestamp(event.timestamp)} on ${event.targetID} : Low Health PROC from ${this.isFrom4Pc(event) ? 'BloomIns' : 'RandomIns'}`,
      );
    stats.procHealing += effectiveHealing(event);
    stats.procCount += 1;
  }

  onApplyProccedHot(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (isHotFromInsurance(event)) {
      const spellId = event.ability.guid;
      if (spellId === SPELLS.REJUVENATION.id || spellId === SPELLS.REJUVENATION_GERMINATION.id) {
        this.proccedRejuvs += 1;
      } else if (spellId === SPELLS.REGROWTH.id) {
        this.proccedRegrowths += 1;
      } else if (spellId === SPELLS.WILD_GROWTH.id) {
        this.proccedWgs += 1;
      }
    }
  }

  // Differentiating 2pc vs 4pc Insurance procs:
  // A normalizer ties bloom heal to insurance apply/refresh on same timestamp.
  // If there is a tied event, we know the apply/refresh was from bloom (4pc). If there was no
  // tied event, we know it's from a random proc (2pc). There's one problem: while 2pc procs produce
  // refresh events, when a bloom (4pc) refreshes insurance on a target, no refreshbuff event is produced.
  // It's impossible to exactly figure which refreshes have been missed, but if an insurance buff
  // lasts longer than its stated duration we can infer a refresh occured. We keep track of the last
  // 2pc apply/refresh per target, and if it's been too long we infer the healing is from a 4pc proc.

  onInsuranceApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    const was4pc = isInsuranceFromBloom(event);
    this.insuranceInfoByTargetId.set(event.targetID, {
      timestamp: event.timestamp,
      lastHealTimestamp: event.timestamp,
      was4pc,
      tallied: false,
    });
  }

  onInsuranceRemove(event: RemoveBuffEvent | RefreshBuffEvent) {
    this.insuranceRemoveHelper(event.timestamp, event.targetID);
  }

  onInsuranceRefresh(event: RefreshBuffEvent) {
    this.onInsuranceRemove(event);
    this.onInsuranceApply(event);
  }

  onFightEnd(event: FightEndEvent) {
    for (const targetID of this.insuranceInfoByTargetId.keys()) {
      this.insuranceRemoveHelper(event.timestamp, targetID);
    }
  }

  private isFrom4Pc(event: TargettedEvent<any>): boolean {
    if (!this.has4pc || !event.targetID) {
      return false;
    }
    const applyInfo = this.insuranceInfoByTargetId.get(event.targetID);
    if (!applyInfo) {
      console.warn(`No tracked insurance info for targetID ${event.targetID}, but there should be`);
      return false;
    }
    if (applyInfo.was4pc) {
      return true;
    }
    const timeSinceApply = event.timestamp - applyInfo.timestamp;
    return timeSinceApply > RANDOM_INSURANCE_DURATION + BUFFER;
  }

  private insuranceRemoveHelper(timestamp: number, targetID: number) {
    const applyInfo = this.insuranceInfoByTargetId.get(targetID);
    if (!applyInfo) {
      console.warn("No info for removed Insurance! This shouldn't happen");
      return;
    }
    if (applyInfo.tallied) {
      return;
    }
    applyInfo.tallied = true;

    // need to tally remaining HoTs on encounter end, but if a target with Insurance on it despawns
    // it will also be a "remaining HoT" because no removebuff was fired. Differentiate between them
    // by checking timestamp of last HoT heal event
    let endTimestamp = timestamp;
    if (timestamp - applyInfo.lastHealTimestamp > 3000) {
      endTimestamp = applyInfo.lastHealTimestamp;
    }

    const duration = endTimestamp - applyInfo.timestamp;

    if (!this.has4pc) {
      this.randomInsuranceStats.hotUptime += duration;
      return;
    }

    if (applyInfo.was4pc) {
      this.bloomInsuranceStats.hotUptime += duration;
      DEBUG &&
        console.log(
          `${this.owner.formatTimestamp(timestamp)} on ${targetID} : Adding ${(duration / 1000).toFixed(0)}s to Bloom Uptime`,
        );
    } else {
      const randomInsDuration = Math.min(RANDOM_INSURANCE_DURATION, duration);
      this.randomInsuranceStats.hotUptime += randomInsDuration;
      DEBUG &&
        console.log(
          `${this.owner.formatTimestamp(timestamp)} on ${targetID} : Adding ${(randomInsDuration / 1000).toFixed(0)}s to Random Uptime`,
        );

      const extraDuration = duration - RANDOM_INSURANCE_DURATION;
      if (extraDuration > BUFFER) {
        this.bloomInsuranceStats.hotUptime += extraDuration;
        DEBUG &&
          console.log(
            `Extra duration detected on Insurance on ${targetID} @ ${this.owner.formatTimestamp(timestamp)} (applied @ ${this.owner.formatTimestamp(applyInfo.timestamp)}, extra duration=${extraDuration})`,
          );
        DEBUG &&
          console.log(
            `${this.owner.formatTimestamp(timestamp)} on ${targetID} : Adding ${(extraDuration / 1000).toFixed(0)}s to Bloom (extra) Uptime`,
          );
      }
    }
  }

  private formatTableHeal(amount: number) {
    return <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(amount))}%</strong>;
  }

  private secPerMinFormatted(valMs: number) {
    return (
      <>
        <strong>{this.owner.getPerMinute(valMs / 1000).toFixed(1)}s</strong>
        <small> per minute*</small>
      </>
    );
  }

  get total2PcHealing() {
    return this.randomInsuranceStats.hotHealing + this.randomInsuranceStats.procHealing;
  }

  get total4PcHealing() {
    return (
      this.bloomInsuranceStats.hotHealing +
      this.bloomInsuranceStats.procHealing +
      this.deps.hotAttributor.tww2TierAttrib.healing
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Random Insurance procs (from 2pc):
            <ul>
              <li>Uptime: {this.secPerMinFormatted(this.randomInsuranceStats.hotUptime)}</li>
              <li>HoT Healing: {this.formatTableHeal(this.randomInsuranceStats.hotHealing)}</li>
              <li>
                Low Health Procs:{' '}
                <strong>
                  {this.owner.getPerMinute(this.randomInsuranceStats.procCount).toFixed(1)}
                </strong>
                <small> per minute</small>
              </li>
              <li>
                Low Health Proc Healing:{' '}
                {this.formatTableHeal(this.randomInsuranceStats.procHealing)}
              </li>
            </ul>
            {this.has4pc && (
              <>
                Bloom Insurance procs (from 4pc):
                <ul>
                  <li>Uptime: {this.secPerMinFormatted(this.bloomInsuranceStats.hotUptime)}</li>
                  <li>HoT Healing: {this.formatTableHeal(this.bloomInsuranceStats.hotHealing)}</li>
                  <li>
                    Low Health Procs:{' '}
                    <strong>
                      {this.owner.getPerMinute(this.bloomInsuranceStats.procCount).toFixed(1)}
                    </strong>
                    <small> per minute</small>
                  </li>
                  <li>
                    Low Health Proc Healing:{' '}
                    {this.formatTableHeal(this.bloomInsuranceStats.procHealing)}
                  </li>
                </ul>
                Procced Rejuv/Regrowth/WG healing (from 4pc):{' '}
                {this.formatTableHeal(this.deps.hotAttributor.tww2TierAttrib.healing)}
                <ul>
                  <li>
                    <SpellLink spell={SPELLS.REJUVENATION} />
                    s: <strong>{this.owner.getPerMinute(this.proccedRejuvs).toFixed(1)}</strong>
                    <small> per minute</small>
                  </li>
                  <li>
                    <SpellLink spell={SPELLS.REGROWTH} />
                    s: <strong>{this.owner.getPerMinute(this.proccedRegrowths).toFixed(1)}</strong>
                    <small> per minute</small>
                  </li>
                  <li>
                    <SpellLink spell={SPELLS.WILD_GROWTH} />
                    s: <strong>{this.owner.getPerMinute(this.proccedWgs).toFixed(1)}</strong>
                    <small> per minute</small>
                  </li>
                </ul>
                <p>
                  *{' '}
                  <small>
                    Uptime and proc counts are 'per minute' to normalize by encounter duration.
                    Uptime may be more than '60 seconds per minute' because it is the sum of uptimes
                    over all targets.
                  </small>
                </p>
              </>
            )}
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={DRUID_TWW2_ID}>
              <>
                Roots of Reclaiming Blight
                <br />
                (TWW S2 Set)
              </>
            </ItemSetLink>
          </label>
          <div className="value">
            2pc: <ItemPercentHealingDone amount={this.total2PcHealing} />
            <br />
            4pc:{' '}
            {this.has4pc ? (
              <ItemPercentHealingDone amount={this.total4PcHealing} />
            ) : (
              'Not Equipped'
            )}
          </div>
        </div>
      </Statistic>
    );
  }
}

interface InsuranceStats {
  /** Total uptime of insurance HoT */
  hotUptime: number;
  /** Total healing of insurance HoT */
  hotHealing: number;
  /** Total low health procs */
  procCount: number;
  /** Total healing of low health procs */
  procHealing: number;
}

interface InsApplyInfo {
  timestamp: number;
  lastHealTimestamp: number;
  was4pc: boolean;
  tallied: boolean;
}
