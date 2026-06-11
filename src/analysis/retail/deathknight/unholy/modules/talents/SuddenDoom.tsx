import SPELLS from 'common/SPELLS';
import DK_SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { PerformanceMark } from 'interface/guide';
import { TipBox } from 'interface/guide/components';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { formatPercentage } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import DonutChart from 'parser/ui/DonutChart';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Abilities from '../Abilities';
import { SuddenDoomConsumption } from '../../normalizers/SuddenDoomLink';
import RunicPowerTracker from '../core/RunicPowerTracker';
import type { JSX } from 'react';

const SUDDEN_DOOM_PROC_SPENDER_SPELLS = [
  SPELLS.DEATH_COIL,
  SPELLS.EPIDEMIC,
  DK_SPELLS.NECROTIC_COIL,
  DK_SPELLS.GRAVEYARD,
];
const SUDDEN_DOOM_PROC_SPENDER_SPELL_IDS = new Set(
  SUDDEN_DOOM_PROC_SPENDER_SPELLS.map((spell) => spell.id),
);
const MELEE_SPELL_IDS = new Set([1, 6603]);
const SUDDEN_DOOM_MIN_RP_RAW = 150;

type SuddenDoomProcResolutionType = 'consumed' | 'expired' | 'overwritten';

export interface SuddenDoomProc {
  timestamp: number;
  type: SuddenDoomProcResolutionType;
}

export interface SuddenDoomCastWhileActive {
  timestamp: number;
  spellId: number;
  spellName: string;
  icon: string;
  suddenDoomStacks: number;
  hadEnoughRunicPower: boolean;
  runicPower: number;
  isSuddenDoomSpender: boolean;
  isConsumer?: boolean;
}

export interface SuddenDoomProcWindow {
  id: number;
  gainedAt: number;
  resolvedAt: number;
  resolution: SuddenDoomProcResolutionType;
  consumedBySpellId?: number;
  consumedByCastTimestamp?: number;
  casts: SuddenDoomCastWhileActive[];
}

interface MutableSuddenDoomProcWindow {
  id: number;
  gainedAt: number;
  casts: SuddenDoomCastWhileActive[];
}

interface ProcCounts {
  consumed: number;
  expired: number;
  overwritten: number;
}

class SuddenDoom extends Analyzer.withDependencies({
  abilities: Abilities,
  runicPowerTracker: RunicPowerTracker,
}) {
  private currentStacks = 0;
  private lastRemoveBuffStackTimestamp: number | null = null;
  private nextProcId = 1;
  private readonly consumedProcTimestamps = new Set<number>();
  private readonly pendingRefreshOverwriteTimestamps = new Set<number>();
  private readonly activeProcWindows: MutableSuddenDoomProcWindow[] = [];
  private procCountsCache?: { total: number; counts: ProcCounts };

  readonly procs: SuddenDoomProc[] = [];
  readonly procWindows: SuddenDoomProcWindow[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SUDDEN_DOOM_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onRemoveBuffStack,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onAnyCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SUDDEN_DOOM_PROC_SPENDER_SPELLS),
      this.onCast,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.flushPendingRefreshOverwrites(event.timestamp);
    this.openProcWindow(event.timestamp);
    this.currentStacks = 1;
  }

  onApplyBuffStack(event: ApplyBuffStackEvent) {
    this.flushPendingRefreshOverwrites(event.timestamp);
    const gainedStacks = Math.max(0, event.stack - this.currentStacks);
    for (let i = 0; i < gainedStacks; i += 1) {
      this.openProcWindow(event.timestamp);
    }
    this.currentStacks = event.stack;
  }

  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.flushPendingRefreshOverwrites(event.timestamp);
    // 2 → 1 stack (consumption at 2 stacks).
    // Use event link to confirm this was a cast consumption, mirroring onRemoveBuff logic.
    const linkedCast = SuddenDoomConsumption.first(event);
    if (linkedCast) {
      this.pendingRefreshOverwriteTimestamps.delete(event.timestamp);
      this.resolveOldestActiveProc(
        'consumed',
        event.timestamp,
        linkedCast.ability.guid,
        linkedCast.timestamp,
      );
    }
    this.lastRemoveBuffStackTimestamp = event.timestamp;
    this.currentStacks = event.stack;
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    if (this.currentStacks < 2) {
      return;
    }

    if (this.consumedProcTimestamps.has(event.timestamp)) {
      return;
    }

    if (this.lastRemoveBuffStackTimestamp === event.timestamp) {
      return;
    }

    this.flushPendingRefreshOverwrites(event.timestamp);
    this.pendingRefreshOverwriteTimestamps.add(event.timestamp);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.flushPendingRefreshOverwrites(event.timestamp);
    if (this.currentStacks === 0 && this.activeProcWindows.length === 0) {
      // Already consumed by onCast
      return;
    }

    // Use the event link to determine if this removal was caused by a cast
    const linkedCast = SuddenDoomConsumption.first(event);
    if (linkedCast) {
      this.pendingRefreshOverwriteTimestamps.delete(event.timestamp);
      this.resolveOldestActiveProc(
        'consumed',
        event.timestamp,
        linkedCast.ability.guid,
        linkedCast.timestamp,
      );
    } else {
      this.expireAllActiveProcs(event.timestamp);
    }

    // removebuff means the aura is now gone; expire any leftovers to keep windows consistent.
    if (this.activeProcWindows.length > 0) {
      this.expireAllActiveProcs(event.timestamp);
    }

    this.currentStacks = 0;
  }

  onCast(event: CastEvent) {
    this.flushPendingRefreshOverwrites(event.timestamp);
    if (this.currentStacks <= 0) {
      // Either no buff, or removebuff/removebuffstack already fired at the same
      // timestamp (WCL ordering). In that case, the event link handler already
      // recorded the consumption.
      return;
    }

    if (this.isSuddenDoomProcSpender(event.ability.guid)) {
      this.recordCastWhileActive(event, this.currentStacks);
    }

    // If this cast is already linked to a later removebuff/removebuffstack event,
    // defer consumption tracking to those handlers. This avoids prematurely
    // consuming at 1 stack when a second stack event is still queued before
    // the linked removal event in log order.
    const linkedRemoval = SuddenDoomConsumption.reverse.first(event);
    if (linkedRemoval) {
      return;
    }

    if (this.currentStacks === 1) {
      // Check if removebuffstack already recorded this consumption at the same timestamp
      // (WCL can fire removebuffstack before cast when going 2→1)
      const lastProc = this.procs.at(-1);
      if (lastProc?.timestamp === event.timestamp && lastProc.type === 'consumed') {
        return;
      }
      this.resolveOldestActiveProc(
        'consumed',
        event.timestamp,
        event.ability.guid,
        event.timestamp,
      );
      this.currentStacks = 0;
    }
    // If stacks > 1, removebuffstack handles the consumption tracking
  }

  onAnyCast(event: CastEvent) {
    this.flushPendingRefreshOverwrites(event.timestamp);
    if (this.activeProcWindows.length === 0) {
      return;
    }

    if (this.isSuddenDoomProcSpender(event.ability.guid)) {
      return;
    }

    // Ignore melee/auto-attack events in Sudden Doom cast sequences.
    if (MELEE_SPELL_IDS.has(event.ability.guid) || event.ability.name === 'Melee') {
      return;
    }

    const ability = this.deps.abilities.getAbility(event.ability.guid);

    // Ignore external item/trinket casts.
    if (ability === undefined) {
      return;
    }

    // Ignore off-GCD casts like Mind Freeze, Dark Transformation, potions, Lichborne, racials.
    if (ability.gcd === null) {
      return;
    }

    const icon = event.ability.abilityIcon.replace('.jpg', '');
    if (!icon || !event.ability.name) {
      return;
    }

    this.recordCastWhileActive(event, this.currentStacks, this.getRunicPowerRaw(event), icon);
  }

  onFightEnd(event: FightEndEvent) {
    this.flushPendingRefreshOverwrites(Number.POSITIVE_INFINITY);
    this.expireAllActiveProcs(event.timestamp);
    this.currentStacks = 0;
  }

  private flushPendingRefreshOverwrites(timestamp: number) {
    for (const consumedTimestamp of this.consumedProcTimestamps) {
      if (consumedTimestamp < timestamp) {
        this.consumedProcTimestamps.delete(consumedTimestamp);
      }
    }

    for (const pendingTimestamp of this.pendingRefreshOverwriteTimestamps) {
      if (pendingTimestamp >= timestamp) {
        continue;
      }

      this.resolveOverwrittenProc(pendingTimestamp);
      this.pendingRefreshOverwriteTimestamps.delete(pendingTimestamp);
    }
  }

  private openProcWindow(timestamp: number) {
    this.activeProcWindows.push({
      id: this.nextProcId,
      gainedAt: timestamp,
      casts: [],
    });
    this.nextProcId += 1;
  }

  private isSuddenDoomProcSpender(spellId: number): boolean {
    return SUDDEN_DOOM_PROC_SPENDER_SPELL_IDS.has(spellId);
  }

  private getRunicPowerRaw(event: CastEvent, runicPowerRaw?: number): number {
    if (runicPowerRaw !== undefined) {
      return runicPowerRaw;
    }

    return (
      getResource(event.classResources, RESOURCE_TYPES.RUNIC_POWER.id)?.amount ??
      this.deps.runicPowerTracker.current
    );
  }

  private findLastCastBySpellAndTimestamp(
    casts: SuddenDoomCastWhileActive[],
    spellId: number,
    castTimestamp: number,
  ): SuddenDoomCastWhileActive | undefined {
    for (let index = casts.length - 1; index >= 0; index -= 1) {
      const cast = casts[index];
      if (cast.spellId === spellId && cast.timestamp === castTimestamp) {
        return cast;
      }
    }

    return undefined;
  }

  private removeConsumedCastFromOverwrittenWindows(
    spellId: number,
    castTimestamp: number,
  ): SuddenDoomCastWhileActive | undefined {
    let recoveredCast: SuddenDoomCastWhileActive | undefined;

    this.procWindows.forEach((window) => {
      if (window.resolution !== 'overwritten' || window.casts.length === 0) {
        return;
      }

      const matchingCast = this.findLastCastBySpellAndTimestamp(
        window.casts,
        spellId,
        castTimestamp,
      );
      if (!recoveredCast && matchingCast) {
        recoveredCast = { ...matchingCast };
      }

      window.casts = window.casts.filter(
        (cast) => !(cast.spellId === spellId && cast.timestamp === castTimestamp),
      );
    });

    return recoveredCast;
  }

  private resolveOldestActiveProc(
    type: SuddenDoomProcResolutionType,
    timestamp: number,
    consumedBySpellId?: number,
    consumedByCastTimestamp?: number,
  ) {
    const proc = this.activeProcWindows.shift();
    if (!proc) {
      return;
    }

    if (
      type === 'consumed' &&
      consumedBySpellId !== undefined &&
      consumedByCastTimestamp !== undefined
    ) {
      const recoveredConsumerCast = this.removeConsumedCastFromOverwrittenWindows(
        consumedBySpellId,
        consumedByCastTimestamp,
      );

      const consumerCast = this.findLastCastBySpellAndTimestamp(
        proc.casts,
        consumedBySpellId,
        consumedByCastTimestamp,
      );

      let resolvedConsumerCast = consumerCast;
      if (!resolvedConsumerCast && recoveredConsumerCast) {
        proc.casts.push(recoveredConsumerCast);
        resolvedConsumerCast = proc.casts.at(-1);
      }

      if (resolvedConsumerCast) {
        resolvedConsumerCast.isConsumer = true;
      }
    }

    const resolvedCasts =
      type === 'overwritten'
        ? proc.casts.filter((cast) => cast.timestamp < timestamp)
        : [...proc.casts];

    if (type === 'consumed') {
      this.consumedProcTimestamps.add(timestamp);

      // Once the oldest stack is spent, any remaining stacked windows should begin
      // tracking from that point forward instead of keeping the older shared casts.
      this.activeProcWindows.forEach((activeProc) => {
        activeProc.casts = [];
      });
    }

    if (type === 'overwritten') {
      // Keep same-timestamp casts on the surviving/replacement proc windows.
      // Those casts happen after the overwrite trigger in event ordering terms.
      this.activeProcWindows.forEach((activeProc) => {
        activeProc.casts = activeProc.casts.filter((cast) => cast.timestamp >= timestamp);
      });
    }

    this.procWindows.push({
      id: proc.id,
      gainedAt: proc.gainedAt,
      resolvedAt: timestamp,
      resolution: type,
      consumedBySpellId,
      consumedByCastTimestamp,
      casts: resolvedCasts,
    });
    this.procs.push({ timestamp, type });
  }

  private recordCastWhileActive(
    event: CastEvent,
    suddenDoomStacks: number,
    runicPowerRaw?: number,
    icon?: string,
  ) {
    const resolvedIcon = icon ?? event.ability.abilityIcon.replace('.jpg', '');
    if (!resolvedIcon || !event.ability.name) {
      return;
    }

    const eventRunicPower = this.getRunicPowerRaw(event, runicPowerRaw);

    const castWhileActive: SuddenDoomCastWhileActive = {
      timestamp: event.timestamp,
      spellId: event.ability.guid,
      spellName: event.ability.name,
      icon: resolvedIcon,
      suddenDoomStacks,
      hadEnoughRunicPower: eventRunicPower >= SUDDEN_DOOM_MIN_RP_RAW,
      runicPower: eventRunicPower / 10,
      isSuddenDoomSpender: this.isSuddenDoomProcSpender(event.ability.guid),
    };

    this.activeProcWindows.forEach((proc) => {
      proc.casts.push({ ...castWhileActive });
    });
  }

  private expireAllActiveProcs(timestamp: number) {
    while (this.activeProcWindows.length > 0) {
      this.resolveOldestActiveProc('expired', timestamp);
    }
  }

  private resolveOverwrittenProc(timestamp: number) {
    // At 2 stacks, refresh means the oldest proc is overwritten and a new proc replaces it.
    const hadActiveProc = this.activeProcWindows.length > 0;
    this.resolveOldestActiveProc('overwritten', timestamp);
    if (hadActiveProc) {
      this.openProcWindow(timestamp);
    }
  }

  /** Get procs within a time range */
  procsInRange(start: number, end: number): SuddenDoomProc[] {
    return this.procs.filter((p) => p.timestamp >= start && p.timestamp <= end);
  }

  get totalProcs() {
    return this.procs.length;
  }

  private get procCounts(): ProcCounts {
    const cachedCounts =
      this.procCountsCache?.total === this.procs.length ? this.procCountsCache?.counts : undefined;
    if (cachedCounts) {
      return cachedCounts;
    }

    const counts: ProcCounts = {
      consumed: 0,
      expired: 0,
      overwritten: 0,
    };

    for (const proc of this.procs) {
      if (proc.type === 'consumed') {
        counts.consumed += 1;
      } else if (proc.type === 'expired') {
        counts.expired += 1;
      } else {
        counts.overwritten += 1;
      }
    }

    this.procCountsCache = {
      total: this.procs.length,
      counts,
    };

    return counts;
  }

  get consumedProcs() {
    return this.procCounts.consumed;
  }

  get wastedProcs() {
    const procCounts = this.procCounts;
    return procCounts.expired + procCounts.overwritten;
  }

  get wastedExpires() {
    return this.procCounts.expired;
  }

  get wastedRefreshes() {
    return this.procCounts.overwritten;
  }

  get wasteRate() {
    return this.totalProcs > 0 ? this.wastedProcs / this.totalProcs : 0;
  }

  get efficiency() {
    return this.totalProcs > 0 ? 1 - this.wasteRate : 1;
  }

  get perfectAndGoodWindows() {
    return this.procWindows.filter((window) => {
      const performance = this.getWindowPerformance(window);
      return (
        performance === QualitativePerformance.Perfect ||
        performance === QualitativePerformance.Good
      );
    }).length;
  }

  get perfectAndGoodEfficiency() {
    return this.totalProcs > 0 ? this.perfectAndGoodWindows / this.totalProcs : 1;
  }

  get procsPerMinute() {
    return this.totalProcs / (this.owner.fightDuration / 60000);
  }

  get averageCastsBeforeConsumption() {
    const consumed = this.procWindows.filter((proc) => proc.resolution === 'consumed');
    if (consumed.length === 0) {
      return 0;
    }

    const totalCasts = consumed.reduce((sum, proc) => sum + proc.casts.length, 0);
    return totalCasts / consumed.length;
  }

  get expiredWithSpendableRunicPower() {
    return this.procWindows.filter(
      (proc) =>
        proc.resolution === 'expired' && proc.casts.some((cast) => cast.hadEnoughRunicPower),
    ).length;
  }

  private getWindowPerformance(window: SuddenDoomProcWindow): QualitativePerformance {
    if (window.resolution !== 'consumed') {
      return QualitativePerformance.Fail;
    }

    if (window.casts.length <= 2) {
      return QualitativePerformance.Perfect;
    }
    if (window.casts.length <= 4) {
      return QualitativePerformance.Good;
    }

    return QualitativePerformance.Ok;
  }

  private buildWindowSummary(window: SuddenDoomProcWindow): JSX.Element {
    const spendableCastCount = window.casts.filter((cast) => cast.hadEnoughRunicPower).length;

    return (
      <>
        {window.resolution === 'consumed' ? 'Consumed' : 'Missed'} after {window.casts.length} casts
        ({spendableCastCount} with 15+ RP)
      </>
    );
  }

  private buildWindowSequence(window: SuddenDoomProcWindow): CastInSequence[] {
    return window.casts.map((cast) => ({
      timestamp: cast.timestamp,
      spellId: cast.spellId,
      spellName: cast.spellName,
      icon: cast.icon,
      outlineColor:
        window.consumedBySpellId === cast.spellId &&
        window.consumedByCastTimestamp === cast.timestamp
          ? '#22c55e'
          : undefined,
      tooltip: (
        <>
          <div>
            <strong>{cast.spellName}</strong>
          </div>
          <div>Used at {this.owner.formatTimestamp(cast.timestamp)}</div>
          <div>
            {cast.runicPower.toFixed(0)} RP{' '}
            {cast.hadEnoughRunicPower ? '(15+ RP)' : '(under 15 RP)'}
          </div>
          <div>{cast.suddenDoomStacks} Sudden Doom stacks</div>
        </>
      ),
    }));
  }

  private buildCastDetails(): PerCastData[] {
    return this.procWindows.map((window) => {
      const spendableCastCount = window.casts.filter((cast) => cast.hadEnoughRunicPower).length;
      const relevantCast =
        window.casts.find(
          (cast) =>
            cast.spellId === window.consumedBySpellId &&
            cast.timestamp === window.consumedByCastTimestamp,
        ) ?? window.casts.at(-1);

      return {
        performance: this.getWindowPerformance(window),
        timestamp: this.owner.formatTimestamp(window.gainedAt),
        tooltip: this.buildWindowSummary(window),
        stats: [
          {
            value: window.casts.length,
            label: 'Casts before resolve',
          },
          {
            value: spendableCastCount,
            label: 'Casts with 15+ RP',
          },
          {
            value: relevantCast?.suddenDoomStacks ?? 0,
            label: 'Current SD stacks',
          },
        ],
        additionalContent:
          window.casts.length > 0
            ? {
                content: <SpellSequence casts={this.buildWindowSequence(window)} iconSize={32} />,
              }
            : undefined,
        details: (
          <>
            {window.resolution === 'consumed' ? (
              <>
                <SpellLink spell={SPELLS.SUDDEN_DOOM_BUFF} /> consumed by{' '}
                {window.consumedBySpellId ? (
                  <SpellLink spell={window.consumedBySpellId} />
                ) : (
                  'a spender'
                )}{' '}
                at {this.owner.formatTimestamp(window.resolvedAt)}.
              </>
            ) : (
              <>
                <SpellLink spell={SPELLS.SUDDEN_DOOM_BUFF} /> {window.resolution} at{' '}
                {this.owner.formatTimestamp(window.resolvedAt)}.
              </>
            )}
          </>
        ),
      };
    });
  }

  get guideSubsection(): JSX.Element {
    const legend = (
      <TipBox hideIcon>
        <div>
          <PerformanceMark perf={QualitativePerformance.Perfect} /> <strong>Perfect</strong> - Proc
          consumed within 2 GCDs of gaining it.
        </div>
        <div>
          <PerformanceMark perf={QualitativePerformance.Good} /> <strong>Good</strong> - Proc
          consumed within 3–4 GCDs of gaining it.
        </div>
        <div>
          <PerformanceMark perf={QualitativePerformance.Ok} /> <strong>Ok</strong> - Proc consumed,
          but took 5 or more GCDs.
        </div>
        <div>
          <PerformanceMark perf={QualitativePerformance.Fail} /> <strong>Fail</strong> - Proc
          expired (fell off) or was overwritten at 2 stacks without being consumed.
        </div>
      </TipBox>
    );

    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={SPELLS.SUDDEN_DOOM_BUFF} />
          </strong>{' '}
          should be consumed as soon as possible. Letting a proc expire or get overwritten at 2
          stacks is a direct damage loss — you lose a free, empowered{' '}
          <SpellLink spell={SPELLS.DEATH_COIL} /> cast. This section tracks every proc window from
          gain until consumption or loss, and records each cast made while the proc was active.
        </p>
        {legend}
      </>
    );

    const data = (
      <RoundedPanel>
        <strong>
          <SpellLink spell={SPELLS.SUDDEN_DOOM_BUFF} /> proc efficiency
        </strong>
        <div style={{ marginTop: '6px', marginBottom: '10px' }}>
          {formatPercentage(this.perfectAndGoodEfficiency, 0)}% <small>perfect+good windows</small>
        </div>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <CastDetail title="Proc Windows" casts={this.buildCastDetails()} />
        </div>
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data, 40);
  }

  get suggestionThresholds() {
    return {
      actual: this.wasteRate,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.SUDDEN_DOOM_BUFF}>
          <div>
            {formatPercentage(this.efficiency, 0)}% <small>efficiency</small>
          </div>
          <div>
            {this.procsPerMinute.toFixed(1)} <small>procs/min</small>
          </div>
          <div>
            {this.averageCastsBeforeConsumption.toFixed(1)} <small>casts to consume</small>
          </div>
        </BoringSpellValueText>
        <div style={{ padding: '8px' }}>
          <DonutChart
            items={[
              {
                color: '#22c55e',
                label: 'Consumed',
                value: this.consumedProcs,
                valuePercent: false,
                valueTooltip: `${this.consumedProcs} procs used`,
              },
              {
                color: '#ef4444',
                label: 'Expired',
                value: this.wastedExpires,
                valuePercent: false,
                valueTooltip: `${this.wastedExpires} procs expired without being used`,
              },
              {
                color: '#f59e0b',
                label: 'Overwritten',
                value: this.wastedRefreshes,
                valuePercent: false,
                valueTooltip: `${this.wastedRefreshes} procs overwritten by new procs`,
              },
            ]}
          />
        </div>
      </Statistic>
    );
  }
}

export default SuddenDoom;
