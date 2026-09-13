import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  ApplyDebuffEvent,
  BeginCastEvent,
  CastEvent,
  DamageEvent,
  FightEndEvent,
  HasRelatedEvent,
  RefreshDebuffEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { GraphData } from 'analysis/retail/evoker/shared/modules/components/ExplanationGraph';
import { SpellLink } from 'interface';
import {
  DISINTEGRATE_REMOVE_APPLY,
  getDisintegrateCast,
  getDisintegrateTargetCount,
  isFromMassDisintegrate,
  isMassDisintegrateDebuff,
  isMassDisintegrateTick,
} from '../normalizers/CastLinkNormalizer';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { GetDisintegrateTicks } from '../../constants';
import { BadColor } from 'interface/guide';
import { isMythicPlus } from 'common/isMythicPlus';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  CastWindow,
  DisintegrateWindowAnalysis,
  PerWindowStat,
} from '../components/DisintegrateWindowAnalysis';
import { PerCastData, StackedBar } from 'interface/guide/components';
import { AdditionalContent } from 'interface/guide/components/CastDetail';
import { ChainClipStatus, DisintegrateCastAnalysis } from '../components/DisintegrateCastAnalysis';

const { DISINTEGRATE } = SPELLS;
const { DRAGONRAGE_TALENT } = TALENTS;

interface ChainClipLogic {
  allowGoodClippingDragonrage: boolean;
  thresholdEarlyChainTicksDragonrage: number;
  thresholdClipTicksDragonrage: number;
  allowGoodClipping: boolean;
  thresholdEarlyChainTicks: number;
  thresholdClipTicks: number;
}

const SCALECOMMANDER_LOGIC: ChainClipLogic = {
  allowGoodClippingDragonrage: false,
  thresholdEarlyChainTicksDragonrage: 1,
  thresholdClipTicksDragonrage: 1,
  allowGoodClipping: false,
  thresholdEarlyChainTicks: 1,
  thresholdClipTicks: 1,
};
const FLAMESHAPER_LOGIC: ChainClipLogic = {
  allowGoodClippingDragonrage: true,
  thresholdEarlyChainTicksDragonrage: 1,
  thresholdClipTicksDragonrage: 1,
  allowGoodClipping: true,
  thresholdEarlyChainTicks: 1,
  thresholdClipTicks: 1,
};

interface TrackedCast {
  //Mass Disintegrate
  massDisTargets?: number;
  massDisTicks?: number;
  //Basic Stats
  dragonRageActive: boolean;
  maxTickCount: number;
  tickCount: number;
  mainTarget: string;
  //Chaining/Clipping
  preceedingCast?: number;
  followingCast?: number;
  spellId: number;
  performance: QualitativePerformance;
  reason: JSX.Element | string;
  chainClipStatus: ChainClipStatus;
  //Basic Cast Stuff
  active: boolean;
  timestamp: number;
}

interface WindowData {
  name: string;
  start: number;
  end: number;
  windowEndedOrPushed: boolean;
  casts?: TrackedCast[];
}

/**
 * Disintegrate is Devastation's ST spender, it is one of the primary focus points of your rotation.
 * Since Devastation's damage kit is rather small, the importance of playing well around the few spells
 * you have in your rotation is very important.
 *
 * This module aims to provide the user with a simple, easy and detailed way to analysis their overall
 * efficiency, as well as the ability to deep dive into individual casts.
 *
 * The first part of the module provides quick feedback regarding cast efficiencies based on current APL.
 * This part provides feedback on on dropped ticks inside and outside of Dragonrage.
 *
 * The second part is a graph that shows individual Disintegrate casts as well as the ticks.
 * This part produces a detailed overview over their entire cast history of Disintegrate.
 * Along with points pointing out good and bad casts, along with explanations.
 *
 */
class BetterDisintegrate extends Analyzer {
  /** Spells that you *can* clip with
   * Any other spell used to clip Disintegrate
   * is counted as a cancelled cast
   * Fill with most spells so it's easy to see what was used to clip with on the graph
   */
  trackedSpells = [
    SPELLS.LIVING_FLAME_CAST,
    SPELLS.FIRE_BREATH,
    SPELLS.FIRE_BREATH_FONT,
    SPELLS.ETERNITY_SURGE,
    SPELLS.ETERNITY_SURGE_FONT,
    TALENTS.TIP_THE_SCALES_TALENT,
    SPELLS.AZURE_STRIKE,
    TALENTS.PYRE_TALENT,
    TALENTS.DRAGONRAGE_TALENT,
    SPELLS.DEEP_BREATH,
    SPELLS.DEEP_BREATH_SCALECOMMANDER,
    SPELLS.AZURE_SWEEP,
    TALENTS.OBSIDIAN_SCALES_TALENT,
    TALENTS.ZEPHYR_TALENT,
    TALENTS.RESCUE_TALENT,
  ];

  /** Spells that you should clip with */
  goodClipSpells = [
    SPELLS.FIRE_BREATH,
    SPELLS.FIRE_BREATH_FONT,
    SPELLS.ETERNITY_SURGE,
    SPELLS.ETERNITY_SURGE_FONT,
    SPELLS.DEEP_BREATH,
    SPELLS.DEEP_BREATH_SCALECOMMANDER,
  ];
  goodClipSpellIds = this.goodClipSpells.map((spell) => spell.id);

  ticksPerDisintegrate = 0;
  ticksPerChainedDisintegrate = 0;

  activeChainClipLogic = this.selectedCombatant.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT)
    ? SCALECOMMANDER_LOGIC
    : FLAMESHAPER_LOGIC;

  isMythicPlus = isMythicPlus(this.owner.fight);

  inDragonRageWindow = false;

  private defaultCast: TrackedCast = {
    spellId: 0,
    mainTarget: 'self',
    dragonRageActive: false,
    maxTickCount: 0,
    tickCount: 0,
    active: false,
    performance: QualitativePerformance.Fail,
    chainClipStatus: ChainClipStatus.Casted,
    reason: '',
    timestamp: 0,
  };
  previousCast: TrackedCast = structuredClone(this.defaultCast);
  activeCast: TrackedCast = structuredClone(this.defaultCast);
  casts: TrackedCast[] = [];

  defaultWindowData: WindowData = {
    name: '',
    start: 0,
    end: 0,
    windowEndedOrPushed: false,
  };
  windowData: WindowData = structuredClone(this.defaultWindowData);
  windows: WindowData[] = [];
  pullData: WindowData[] = [];
  pullIndex = 0;

  graphData: GraphData[] = [];
  explanations: JSX.Element[] = [];

  constructor(options: Options) {
    super(options);

    // Setup
    this.ticksPerDisintegrate = GetDisintegrateTicks(this.selectedCombatant).disintegrateTicks;
    this.ticksPerChainedDisintegrate = GetDisintegrateTicks(
      this.selectedCombatant,
    ).disintegrateChainedTicks;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT),
      this.onApplyDragonrage,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT),
      this.onRemoveDragonrage,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(DISINTEGRATE),
      this.onDisintegrateTick,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(DISINTEGRATE),
      this.onDisintegrateCast,
    );

    /**
     * We use debuff events for Disintegrate for consistency
     * Since the only way to know when a disintegrate ended is on removed debuff
     * and the first damage tick happens on application not cast.
     */
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(DISINTEGRATE),
      this.onApplyDebuff,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(DISINTEGRATE),
      this.onRefreshDebuff,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(DISINTEGRATE),
      this.onRemoveDebuff,
    );

    [Events.cast, Events.begincast].forEach((type) =>
      this.addEventListener(type.by(SELECTED_PLAYER).spell(this.trackedSpells), this.onGeneralCast),
    );

    this.addEventListener(Events.fightend, this.onFightEnd);

    if (this.isMythicPlus && this.owner.fight.dungeonPulls !== undefined) {
      this.owner.fight.dungeonPulls.forEach((dungeonPull) => {
        if (this.windowData.start !== 0) {
          this.windowData.end = dungeonPull.start_time;
          this.pullData.push(this.windowData);
        }
        if (!dungeonPull.boss) {
          this.windowData = {
            start: dungeonPull.start_time,
            end: 0,
            windowEndedOrPushed: true, // Mark Trash pulls as EndedorPushed to exclude them
            name: 'Trash',
          };
        } else {
          this.windowData = {
            start: dungeonPull.start_time,
            end: 0,
            windowEndedOrPushed: false,
            name: dungeonPull.name,
          };
        }
      });
      if (this.windowData.start !== 0) {
        this.pullData.push(this.windowData);
      }
    }
  }

  /** Grab the spell we clipped with - this event always happens before the debuffRemove event
   * (Atleast for all the logs I've looked at so far) */
  private onGeneralCast(event: CastEvent | BeginCastEvent) {
    if (this.activeCast.tickCount > 0) {
      this.activeCast.followingCast = event.ability.guid;
    }

    if (this.activeCast.active || this.isPullEndDungeon(event)) this.endCast(event);
  }

  private onApplyDragonrage(event: ApplyBuffEvent) {
    if (!this.isMythicPlus) this.endWindow(event);
    this.inDragonRageWindow = true;
  }

  private onRemoveDragonrage(event: RemoveBuffEvent) {
    this.inDragonRageWindow = false;

    if (!this.isMythicPlus) {
      this.windowData.windowEndedOrPushed = true;
    }
  }

  private onDisintegrateTick(event: DamageEvent) {
    if (isMassDisintegrateTick(event)) {
      if (this.activeCast.massDisTicks !== undefined) this.activeCast.massDisTicks += 1;
      return;
    }

    // This should not happen but w/e
    if (this.activeCast.tickCount === 0) {
      return;
    }
    this.activeCast.tickCount -= 1;
  }

  private onDisintegrateCast(event: CastEvent) {
    if (this.activeCast.tickCount > 0) {
      this.activeCast.followingCast = isFromMassDisintegrate(event)
        ? SPELLS.MASS_DISINTEGRATE_BUFF.id
        : SPELLS.DISINTEGRATE.id;
    }
    if (this.activeCast.active || this.isPullEndDungeon(event)) this.endCast(event);

    this.activeCast.active = true;
    this.activeCast.timestamp = event.timestamp;
    this.activeCast.dragonRageActive = this.inDragonRageWindow;
    this.activeCast.spellId = isFromMassDisintegrate(event)
      ? SPELLS.MASS_DISINTEGRATE_BUFF.id
      : SPELLS.DISINTEGRATE.id;

    if (this.isActiveCastMassDis()) {
      this.activeCast.massDisTargets = getDisintegrateTargetCount(event);
      this.activeCast.massDisTicks = 0;
    }
  }

  private onApplyDebuff(event: ApplyDebuffEvent) {
    if (isMassDisintegrateDebuff(event)) {
      return;
    }

    // This is actually a refresh event or chained cast
    if (HasRelatedEvent(event, DISINTEGRATE_REMOVE_APPLY)) {
      this.onRefreshDebuff(event);
      return;
    }

    this.activeCast.mainTarget = encodeEventTargetString(event);
    this.activeCast.maxTickCount = this.ticksPerDisintegrate;
    this.activeCast.tickCount = this.activeCast.maxTickCount;

    if (this.isActiveCastMassDis()) this.massDisintSanityCheck(event);
  }

  private onRefreshDebuff(event: RefreshDebuffEvent | ApplyDebuffEvent) {
    if (isMassDisintegrateDebuff(event)) {
      return;
    }

    this.activeCast.mainTarget = encodeEventTargetString(event);
    /** Chained Disintegrate moves over one tick from current cast (Pandemic) */
    this.activeCast.maxTickCount =
      this.ticksPerDisintegrate + Math.min(this.previousCast.tickCount, 1);
    this.activeCast.tickCount = this.activeCast.maxTickCount;
    this.activeCast.preceedingCast = this.previousCast.spellId;

    if (this.isActiveCastMassDis()) this.massDisintSanityCheck(event);
  }

  private onRemoveDebuff(event: RemoveDebuffEvent) {
    // This is a fake removal ignore it
    if (HasRelatedEvent(event, DISINTEGRATE_REMOVE_APPLY)) {
      return;
    }

    if (this.activeCast.mainTarget !== encodeEventTargetString(event)) {
      return;
    }
  }

  private onFightEnd(event: FightEndEvent) {
    // Pushes remaining windows
    if (this.isMythicPlus) {
      if (!this.pullData[this.pullIndex].windowEndedOrPushed) {
        this.pullData[this.pullIndex].end = event.timestamp;
        this.endWindow(event);
      }
    } else {
      this.endWindow(event);
    }
    this.windows.forEach((w) => {
      if (w.casts) w.casts = this.RateCasts(w.casts);
    });
  }

  private endCast(event: CastEvent | BeginCastEvent | ApplyDebuffEvent) {
    let pushed = false;
    if (!this.activeCast.dragonRageActive) {
      this.checkRecordingWindowEnd(event);
      pushed = true;
    }
    if (this.activeCast.active) this.casts.push(this.activeCast);
    this.previousCast = this.activeCast;
    this.activeCast = structuredClone(this.defaultCast);
    if (!pushed) this.checkRecordingWindowEnd(event);
  }

  private endWindow(event: AnyEvent) {
    if (!this.isMythicPlus) {
      if (this.windowData.start !== 0) {
        this.windowData.end = event.timestamp;
        this.windowData.casts = this.casts;
        this.windowData.windowEndedOrPushed = true;
        this.windows.push(this.windowData);
      }
      this.windowData = {
        start: event.timestamp,
        end: 0,
        windowEndedOrPushed: false,
        name: 'Window',
      };
      this.casts = [];
    } else {
      this.pullData[this.pullIndex].casts = this.casts;
      this.pullData[this.pullIndex].windowEndedOrPushed = true;
      this.windows.push(this.pullData[this.pullIndex]);
      console.log(this.casts);
    }
  }

  private checkRecordingWindowEnd(event: AnyEvent) {
    // Check if the pull/dragonrage window has ended
    if (!this.isMythicPlus && this.windowData.windowEndedOrPushed) {
      this.endWindow(event);
    } else if (this.isPullEndDungeon(event)) {
      this.pullData[this.pullIndex].end = event.timestamp;
      if (!this.pullData[this.pullIndex].windowEndedOrPushed) this.endWindow(event);
      this.pullIndex++;
      this.casts = [];
    }
  }

  private isPullEndDungeon(event: AnyEvent) {
    return (
      this.isMythicPlus &&
      this.pullIndex < this.pullData.length - 1 &&
      event.timestamp > this.pullData[this.pullIndex + 1].start
    );
  }

  private isActiveCastMassDis(): boolean {
    return this.activeCast.spellId === SPELLS.MASS_DISINTEGRATE_BUFF.id;
  }

  private RateCasts(casts: TrackedCast[]): TrackedCast[] {
    casts.forEach((c, idx) => {
      if (
        c.followingCast === SPELLS.MASS_DISINTEGRATE_BUFF.id ||
        c.followingCast === SPELLS.DISINTEGRATE.id
      ) {
        // Cast has been chained
        if (c.followingCast != c.spellId) {
          c.reason = 'Bad Chain: Chained Mass Disintegrate into Disintegrate';
        } else if (idx + 1 < casts.length && c.mainTarget != casts[idx + 1].mainTarget) {
          c.reason = 'Bad Chain: Swapped Targets';
        } else if (
          (c.tickCount > this.activeChainClipLogic.thresholdEarlyChainTicks &&
            c.spellId != SPELLS.MASS_DISINTEGRATE_BUFF.id) ||
          (c.dragonRageActive &&
            c.tickCount > this.activeChainClipLogic.thresholdEarlyChainTicksDragonrage &&
            c.spellId != SPELLS.MASS_DISINTEGRATE_BUFF.id) ||
          (c.tickCount > 1 && c.spellId != SPELLS.MASS_DISINTEGRATE_BUFF.id)
        ) {
          c.reason = `Bad Chain: Chained too early, clipping ${c.tickCount - 1} tick(s).`;
        } else {
          c.performance = QualitativePerformance.Good;
          c.reason = 'Good Chain';
        }
        c.chainClipStatus = ChainClipStatus.Chained;
      } else if (c.followingCast && c.tickCount >= 1) {
        // Cast has been clipped
        if (
          ((this.activeChainClipLogic.allowGoodClipping &&
            c.tickCount <= this.activeChainClipLogic.thresholdClipTicksDragonrage) ||
            (this.activeChainClipLogic.allowGoodClippingDragonrage &&
              c.tickCount <= this.activeChainClipLogic.thresholdClipTicksDragonrage &&
              c.dragonRageActive)) &&
          this.goodClipSpellIds.includes(c.followingCast) &&
          c.spellId != SPELLS.MASS_DISINTEGRATE_BUFF.id
        ) {
          c.performance = QualitativePerformance.Perfect;
          c.reason = (
            <>
              Perfect Clip: Clipped with <SpellLink spell={c.followingCast} />
            </>
          );
        } else {
          c.reason = (
            <>
              Bad Clip: Clipped {c.tickCount} tick(s) with <SpellLink spell={c.followingCast} />
            </>
          );
        }
        c.chainClipStatus = ChainClipStatus.Clipped;
      } else if (c.tickCount >= 1) {
        c.performance = QualitativePerformance.Fail;
        c.reason = "Cancel: Don't cancel Disintegrate early.";
        c.chainClipStatus = ChainClipStatus.Cancelled;
      } else {
        c.performance = QualitativePerformance.Good;
        c.reason = 'Good Cast';
      }
    });

    return casts;
  }

  private massDisintSanityCheck(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const castEvent = getDisintegrateCast(event);
    if (castEvent === undefined)
      this.addDebugAnnotation(event, {
        color: BadColor,
        summary:
          'Found no targets for Mass Disintegrate. Known to be caused by instance recycling (Two Mobs in the log have the same ID)',
      });
  }

  private generateCastDistribution(casts: TrackedCast[]): AdditionalContent {
    let disintCasts = 0,
      massDisintCasts = 0;
    casts.forEach((c) => {
      if (c.massDisTicks === undefined) disintCasts++;
      else massDisintCasts++;
    });

    return {
      title: 'Cast Distribution',
      content: (
        <StackedBar
          segments={[
            {
              label: 'Disintegrate',
              value: disintCasts,
              color: 'hsl(180, 70%, 55%)',
              tooltip: (
                <>
                  {disintCasts} <SpellLink spell={SPELLS.DISINTEGRATE} /> casted.
                </>
              ),
            },
            {
              label: 'Mass Disintegrate',
              value: massDisintCasts,
              color: 'hsl(220, 70%, 55%)',
              tooltip: (
                <>
                  {massDisintCasts} <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} /> casted.
                </>
              ),
            },
          ]}
        />
      ),
    };
  }
  private generateChainDistribution(casts: TrackedCast[]): AdditionalContent {
    let chained = 0,
      clipped = 0,
      casted = 0;
    casts.forEach((c) => {
      if (c.chainClipStatus === ChainClipStatus.Chained) chained++;
      else if (c.chainClipStatus === ChainClipStatus.Clipped) clipped++;
      else casted++;
    });

    return {
      title: 'Chain Distribution',
      content: (
        <StackedBar
          segments={[
            {
              label: 'Chained',
              value: chained,
              color: 'hsl(180, 70%, 55%)',
              tooltip: <>{chained} casts chained.</>,
            },
            {
              label: 'Clipped',
              value: clipped,
              color: 'hsl(200, 70%, 55%)',
              tooltip: <>{clipped} casts clipped early.</>,
            },
            {
              label: 'Casted',
              value: casted,
              color: 'hsl(220, 70%, 55%)',
              tooltip: <>{casted} casts casted fully.</>,
            },
          ]}
        />
      ),
    };
  }
  private generateWindowStats(casts: TrackedCast[]): PerWindowStat[] {
    const stats = [];

    const actualTicks = [0, 0, 0],
      totalTicks = [0, 0, 0];

    casts.forEach((c, idx) => {
      if (c.massDisTargets) {
        actualTicks[0] += c.massDisTicks! + c.maxTickCount - c.tickCount;
        totalTicks[0] += c.massDisTargets * this.ticksPerDisintegrate;
      } else if (c.dragonRageActive) {
        actualTicks[1] += c.maxTickCount - c.tickCount;
        totalTicks[1] += this.ticksPerDisintegrate;
        if (c.preceedingCast === SPELLS.MASS_DISINTEGRATE_BUFF.id) {
          actualTicks[1]--;
        }
      } else {
        actualTicks[2] += c.maxTickCount - c.tickCount;
        totalTicks[2] += this.ticksPerDisintegrate;
        if (c.preceedingCast === SPELLS.MASS_DISINTEGRATE_BUFF.id) {
          actualTicks[2]--;
        }
      }
    });

    if (totalTicks[2] > 0)
      stats.push({
        label: 'Disintegrate Ticks',
        value: `${actualTicks[2]}/${totalTicks[2]}`,
        performance:
          actualTicks[2] === totalTicks[2]
            ? QualitativePerformance.Good
            : this.activeChainClipLogic.allowGoodClipping ||
                this.activeChainClipLogic.thresholdEarlyChainTicks > 1
              ? QualitativePerformance.Ok
              : QualitativePerformance.Fail,
        tooltip:
          actualTicks[2] === totalTicks[2] ||
          this.activeChainClipLogic.allowGoodClipping ||
          this.activeChainClipLogic.thresholdEarlyChainTicks > 1
            ? 'You casted all Disintegrates correctly.'
            : "You lost some ticks when you shouldn't have.",
      });
    if (totalTicks[1] > 0)
      stats.push({
        label: 'Dragonrage Disintegrate Ticks',
        value: `${actualTicks[1]}/${totalTicks[1]}`,
        performance:
          actualTicks[1] === totalTicks[1]
            ? QualitativePerformance.Good
            : this.activeChainClipLogic.allowGoodClippingDragonrage ||
                this.activeChainClipLogic.thresholdEarlyChainTicksDragonrage > 1
              ? QualitativePerformance.Ok
              : QualitativePerformance.Fail,
        tooltip:
          actualTicks[1] === totalTicks[1] ||
          this.activeChainClipLogic.allowGoodClippingDragonrage ||
          this.activeChainClipLogic.thresholdEarlyChainTicksDragonrage > 1
            ? 'You casted all Disintegrates correctly.'
            : "You lost some ticks when you shouldn't have.",
      });
    if (totalTicks[0] > 0)
      stats.push({
        label: 'Mass Disintegrate Ticks',
        value: `${actualTicks[0]}/${totalTicks[0]}`,
        performance:
          actualTicks[0] === totalTicks[0]
            ? QualitativePerformance.Good
            : QualitativePerformance.Fail,
        tooltip:
          actualTicks[0] === totalTicks[0]
            ? 'You casted all Mass Disintegrates correctly.'
            : "You lost some ticks when you shouldn't have",
      });

    return stats;
  }
  private generateTotalPerforamnce(stats: PerWindowStat[]): QualitativePerformance {
    let totalPerformanceRatio = 0;
    stats.forEach((s) => {
      switch (s.performance) {
        case QualitativePerformance.Perfect:
          totalPerformanceRatio += 3;
          break;
        case QualitativePerformance.Good:
          totalPerformanceRatio += 2;
          break;
        case QualitativePerformance.Ok:
          totalPerformanceRatio += 1;
          break;
      }
    });
    totalPerformanceRatio = Math.round(totalPerformanceRatio);

    switch (totalPerformanceRatio) {
      case 3:
        return QualitativePerformance.Perfect;
      case 2:
        return QualitativePerformance.Good;
      case 1:
        return QualitativePerformance.Ok;
      default:
        return QualitativePerformance.Fail;
    }
  }

  /** Evaluate individual disintegrate casts */
  guideSubSection(): JSX.Element | null {
    const windowData: CastWindow[] = [];

    this.windows.forEach((w) => {
      const disintegrateCasts: PerCastData[] = [];
      const windowStart = this.owner.formatTimestamp(w.start);
      const windowEnd = this.owner.formatTimestamp(w.end);
      if (w.casts) {
        w.casts.forEach((c) => {
          const timestamp = this.owner.formatTimestamp(c.timestamp);
          disintegrateCasts.push({
            performance: c.performance,
            timestamp: `${timestamp}`,
            stats: [],
            additionalContent: {
              content: (
                <DisintegrateCastAnalysis
                  cast={{
                    cast: c.spellId,
                    chainClipStatus: c.chainClipStatus,
                    performance: c.performance,
                    preceedingCast: c.preceedingCast,
                    followingCast: c.followingCast,
                    dragonRageActive: c.dragonRageActive,
                  }}
                />
              ),
            },
            details: c.reason,
            tooltip: `@ ${timestamp}`,
          });
        });

        const additionalContent = [];

        if (w.casts.find((c) => c.massDisTicks !== undefined))
          additionalContent.push(this.generateCastDistribution(w.casts));
        additionalContent.push(this.generateChainDistribution(w.casts));

        const stats = this.generateWindowStats(w.casts);

        windowData.push({
          name: w.name,
          start: windowStart,
          end: windowEnd,
          casts: disintegrateCasts,
          stats: stats,
          additionalContent: additionalContent,
          performance: this.generateTotalPerforamnce(stats),
        });
      }
    });

    return (
      <>
        <DisintegrateWindowAnalysis windows={windowData} title="Cast Window Analysis" />
      </>
    );
  }
}

export default BetterDisintegrate;
