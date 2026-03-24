import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
  DamageEvent,
  HasRelatedEvent,
  GetRelatedEvents,
  GlobalCooldownEvent,
} from 'parser/core/Events';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import SpellLink from 'interface/SpellLink';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import {
  MARK_REMOVAL_TO_DAMAGE,
  MARK_APPLY_TO_RECENT_DAMAGE,
} from '../normalizers/SentinelsMarkNormalizer';

const MOONS_BLESSING_CDR = 6000;
const AIMED_SHOT_CDR = 2000;
const MARK_EXPIRY_THRESHOLD = 11700;

// Multiple marks can be active on different targets simultaneously
// So we will collect them and track them by target ID
interface ActiveMark {
  applyTimestamp: number;
  targetName: string;
  hpPercent: number | null;
  gcdCount: number;
  wastedCdr: number;
}

interface TimestampedEntry extends BoxRowEntry {
  applyTimestamp: number;
}

// Mark can be consumed, refreshed, expire, or target can die
// Player can also be forcibly moved from the area (Dimmensius) or
// The fight can just end
type MarkOutcome =
  | { type: 'consumed'; timestamp: number }
  | { type: 'targetDied'; timestamp: number }
  | { type: 'expired'; timestamp: number }
  | { type: 'expiredUndetected' }
  | { type: 'refreshed'; timestamp: number }
  | { type: 'fightEnd' };

export default class SentinelsMark extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  globalCooldown: GlobalCooldown,
}) {
  private totalApplies = 0;
  private totalRefreshes = 0;
  private totalCDRWaste = 0;
  private targetDeaths = 0;
  private expiredMarks = 0;
  private entries: TimestampedEntry[] = [];
  private activeMarks = new Map<number, ActiveMark>();
  private isSurvival = false;
  private hasMoonsBlessing = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SENTINEL_TALENT);
    if (!this.active) {
      return;
    }

    // Moons Blessing check won't be necessary in midnight due to full hero tree.
    this.isSurvival = this.selectedCombatant.hasTalent(TALENTS.RAPTOR_STRIKE_TALENT);
    this.hasMoonsBlessing = this.selectedCombatant.hasTalent(TALENTS.MOONS_BLESSING_TALENT);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.SENTINELS_MARK_DEBUFF),
      this.onMarkApply,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.SENTINELS_MARK_DEBUFF),
      this.onMarkRefresh,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.SENTINELS_MARK_DEBUFF),
      this.onMarkRemove,
    );
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.onGlobalCooldown);
  }

  // Useful to the player to know how many GCDs they spent with an active mark
  // Consuming a mark is usually in the 1-2 highest priority actions you can take
  private onGlobalCooldown(event: GlobalCooldownEvent) {
    const expiredTargets: number[] = [];

    this.activeMarks.forEach((mark, targetId) => {
      if (event.timestamp > mark.applyTimestamp) {
        mark.gcdCount += 1;
      }

      // Check if mark has been active longer than the expiry threshold
      // This catches marks that expired silently (e.g., Dimmensius phase transition)
      if (event.timestamp - mark.applyTimestamp > MARK_EXPIRY_THRESHOLD) {
        expiredTargets.push(targetId);
      }
    });

    // Finalize expired marks outside the forEach to avoid modifying while iterating
    for (const targetId of expiredTargets) {
      const mark = this.activeMarks.get(targetId);
      if (mark) {
        this.activeMarks.delete(targetId);
        this.expiredMarks += 1;
        this.entries.push(this.buildEntry(mark, { type: 'expiredUndetected' }));
      }
    }
  }

  // Get HP to display. Useful info to help a player judge how unfair the random mark placement was
  private getHpPercent(event: ApplyDebuffEvent | RefreshDebuffEvent): number | null {
    const recentDamage = GetRelatedEvents(event, MARK_APPLY_TO_RECENT_DAMAGE)[0] as
      | DamageEvent
      | undefined;
    if (recentDamage?.hitPoints && recentDamage.maxHitPoints) {
      return (recentDamage.hitPoints / recentDamage.maxHitPoints) * 100;
    }
    return null;
  }

  private calculateWastedCdr(event: ApplyDebuffEvent): number {
    if (!this.hasMoonsBlessing) {
      return 0;
    }

    const talent = this.isSurvival ? TALENTS.WILDFIRE_BOMB_TALENT : TALENTS.AIMED_SHOT_TALENT;
    const maxCdr = this.isSurvival ? MOONS_BLESSING_CDR : AIMED_SHOT_CDR;
    const cdRemaining = this.deps.spellUsable.cooldownRemaining(talent.id, event.timestamp);

    if (cdRemaining <= maxCdr) {
      const waste = maxCdr - cdRemaining;
      this.totalCDRWaste += waste;
      return waste;
    }
    return 0;
  }

  private buildEntry(mark: ActiveMark, outcome: MarkOutcome): TimestampedEntry {
    const endTimestamp = 'timestamp' in outcome ? outcome.timestamp : null;
    const duration =
      endTimestamp !== null ? endTimestamp - mark.applyTimestamp : MARK_EXPIRY_THRESHOLD;
    // Bomb on large targets (and aimed shot to an extent) can proc mark and consume it in the same gcd
    // So max with 0 to avoid a negative value.
    // GCDs between gives a good indication of negligence towards mark management.
    const gcdsBetweenApplyAndRemove = Math.max(mark.gcdCount - 1, 0);

    const baseTooltip = (
      <div>
        <div>
          Target: <strong>{mark.targetName}</strong>
        </div>
        {mark.hpPercent !== null && <div>HP: {mark.hpPercent.toFixed(1)}%</div>}
        <div>Duration: {(duration / 1000).toFixed(1)}s</div>
        <div>GCDs Between Apply and Remove: {gcdsBetweenApplyAndRemove}</div>
        {this.hasMoonsBlessing && mark.wastedCdr > 0 && (
          <div>
            Wasted {(mark.wastedCdr / 1000).toFixed(1)}s{' '}
            {this.isSurvival ? (
              <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} />
            ) : (
              <SpellLink spell={TALENTS.AIMED_SHOT_TALENT} />
            )}{' '}
            CDR
          </div>
        )}
        <div>
          Applied @ <strong>{this.owner.formatTimestamp(mark.applyTimestamp)}</strong>
        </div>
      </div>
    );

    // GOOD: Mark was consumed
    if (outcome.type === 'consumed') {
      return {
        applyTimestamp: mark.applyTimestamp,
        value: QualitativePerformance.Good,
        tooltip: (
          <>
            <h5 style={{ color: GoodColor }}>GOOD: Consumed Mark</h5>
            {baseTooltip}
            <div>
              Consumed @ <strong>{this.owner.formatTimestamp(outcome.timestamp)}</strong>
            </div>
          </>
        ),
      };
    }

    // OK: Target died before player had a reasonable chance to react
    if (outcome.type === 'targetDied' && mark.gcdCount <= 1) {
      const header =
        mark.gcdCount === 0
          ? 'OK: Target Died During Apply GCD'
          : 'OK: Target Died Before Second GCD';
      return {
        applyTimestamp: mark.applyTimestamp,
        value: QualitativePerformance.Ok,
        tooltip: (
          <>
            <h5 style={{ color: OkColor }}>{header}</h5>
            {baseTooltip}
            <div>
              Removed @ <strong>{this.owner.formatTimestamp(outcome.timestamp)}</strong>
            </div>
          </>
        ),
      };
    }

    // FAIL: Target died but player had time to react
    if (outcome.type === 'targetDied') {
      return {
        applyTimestamp: mark.applyTimestamp,
        value: QualitativePerformance.Fail,
        tooltip: (
          <>
            <h5 style={{ color: BadColor }}>FAIL: Target Died with Mark</h5>
            {baseTooltip}
            <div>
              Removed @ <strong>{this.owner.formatTimestamp(outcome.timestamp)}</strong>
            </div>
          </>
        ),
      };
    }

    // FAIL: Mark expired without being consumed
    if (outcome.type === 'expired') {
      return {
        applyTimestamp: mark.applyTimestamp,
        value: QualitativePerformance.Fail,
        tooltip: (
          <>
            <h5 style={{ color: BadColor }}>FAIL: Mark Expired Without Consumption</h5>
            {baseTooltip}
            <div>
              Expired @ <strong>{this.owner.formatTimestamp(outcome.timestamp)}</strong>
            </div>
          </>
        ),
      };
    }

    // FAIL: Mark expired silently (no remove event detected)
    if (outcome.type === 'expiredUndetected') {
      return {
        applyTimestamp: mark.applyTimestamp,
        value: QualitativePerformance.Fail,
        tooltip: (
          <>
            <h5 style={{ color: BadColor }}>FAIL: Mark Expired Without Consumption</h5>
            {baseTooltip}
          </>
        ),
      };
    }

    // FAIL: Mark was refreshed on new target before consumption
    if (outcome.type === 'refreshed') {
      return {
        applyTimestamp: mark.applyTimestamp,
        value: QualitativePerformance.Fail,
        tooltip: (
          <>
            <h5 style={{ color: BadColor }}>FAIL: Refreshed Before Consumption</h5>
            {baseTooltip}
            <div>
              Refreshed @ <strong>{this.owner.formatTimestamp(outcome.timestamp)}</strong>
            </div>
          </>
        ),
      };
    }

    // FAIL: Fight ended with mark still active (outcome.type === 'fightEnd')
    // This covers edge cases of bosses that don't die but the fight still ends.
    return {
      applyTimestamp: mark.applyTimestamp,
      value: QualitativePerformance.Fail,
      tooltip: (
        <>
          <h5 style={{ color: BadColor }}>FAIL: Mark Not Consumed Before Fight End</h5>
          {baseTooltip}
        </>
      ),
    };
  }

  private finalizeMarkAsExpired(targetId: number, timestamp: number) {
    const mark = this.activeMarks.get(targetId);
    if (!mark) {
      return;
    }
    this.activeMarks.delete(targetId);
    this.expiredMarks += 1;
    this.entries.push(this.buildEntry(mark, { type: 'expired', timestamp: timestamp }));
  }

  private onMarkApply(event: ApplyDebuffEvent) {
    // Handle edge case: new apply on target that already has a tracked mark (previous expired quietly)
    if (this.activeMarks.has(event.targetID)) {
      this.finalizeMarkAsExpired(event.targetID, event.timestamp);
    }

    this.totalApplies += 1;

    this.activeMarks.set(event.targetID, {
      applyTimestamp: event.timestamp,
      targetName: this.owner.getTargetName(event),
      hpPercent: this.getHpPercent(event),
      gcdCount: 0,
      wastedCdr: this.calculateWastedCdr(event),
    });
  }

  private onMarkRefresh(event: RefreshDebuffEvent) {
    this.totalRefreshes += 1;
    // Mark the existing mark as a fail and remove it from tracking.
    const previousMark = this.activeMarks.get(event.targetID);
    if (previousMark) {
      this.entries.push(
        this.buildEntry(previousMark, { type: 'refreshed', timestamp: event.timestamp }),
      );
      this.activeMarks.delete(event.targetID);
    }

    this.activeMarks.set(event.targetID, {
      applyTimestamp: event.timestamp,
      targetName: this.owner.getTargetName(event),
      hpPercent: this.getHpPercent(event),
      gcdCount: 0,
      wastedCdr: 0,
    });
  }

  private onMarkRemove(event: RemoveDebuffEvent) {
    const mark = this.activeMarks.get(event.targetID);
    if (!mark) {
      return;
    }
    this.activeMarks.delete(event.targetID);

    const duration = event.timestamp - mark.applyTimestamp;
    const linkedToDamage = HasRelatedEvent(event, MARK_REMOVAL_TO_DAMAGE);

    if (linkedToDamage) {
      this.entries.push(this.buildEntry(mark, { type: 'consumed', timestamp: event.timestamp }));
    } else if (duration < MARK_EXPIRY_THRESHOLD) {
      this.targetDeaths += 1;
      this.entries.push(this.buildEntry(mark, { type: 'targetDied', timestamp: event.timestamp }));
    } else {
      this.expiredMarks += 1;
      this.entries.push(this.buildEntry(mark, { type: 'expired', timestamp: event.timestamp }));
    }
  }

  // Finalize any active marks as expired at fight end
  onFightEnd() {
    this.activeMarks.forEach((mark) => {
      this.expiredMarks += 1;
      this.entries.push(this.buildEntry(mark, { type: 'fightEnd' }));
    });
    this.activeMarks.clear();
  }

  // Entries sorted by apply timestamp as handling is time-independent
  private get sortedEntries(): BoxRowEntry[] {
    return this.entries
      .sort((a, b) => a.applyTimestamp - b.applyTimestamp)
      .map(({ value, tooltip }) => ({ value, tooltip }));
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.SENTINEL_TALENT} />
        </strong>{' '}
        is applied to a random enemy in combat. Avoid refreshing the mark before it's consumed.
        {this.hasMoonsBlessing && this.isSurvival && (
          <>
            {' '}
            With <SpellLink spell={TALENTS.MOONS_BLESSING_TALENT} />, each mark grants 6 seconds of{' '}
            <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} /> cooldown reduction.
          </>
        )}
        {this.hasMoonsBlessing && !this.isSurvival && (
          <>
            {' '}
            With <SpellLink spell={TALENTS.MOONS_BLESSING_TALENT} />, each mark grants 2 seconds of{' '}
            <SpellLink spell={TALENTS.AIMED_SHOT_TALENT} /> cooldown reduction.
          </>
        )}
      </p>
    );

    const data = (
      <CastSummaryAndBreakdown
        spell={TALENTS.SENTINEL_TALENT}
        castEntries={this.sortedEntries}
        usesInsteadOfCasts
      />
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    const wastedMarks = this.totalRefreshes + this.targetDeaths + this.expiredMarks;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.SENTINEL_TALENT}>
          <div>
            {this.totalApplies} <small>marks applied</small>
          </div>
          {wastedMarks > 0 && (
            <div style={{ color: BadColor }}>
              {wastedMarks} <small>wasted marks</small>
            </div>
          )}
          {this.expiredMarks > 0 && (
            <div style={{ color: BadColor }}>
              {this.expiredMarks} <small>expired without use</small>
            </div>
          )}
          {this.hasMoonsBlessing && this.totalCDRWaste > 0 && (
            <div style={{ color: BadColor }}>
              {(this.totalCDRWaste / 1000).toFixed(1)}s{' '}
              <small>{this.isSurvival ? 'Wildfire Bomb' : 'Aimed Shot'} CDR wasted</small>
            </div>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
