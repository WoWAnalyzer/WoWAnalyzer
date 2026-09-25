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
  regularPerformance: PercentageThresholds;
  dragonragePerformance: PercentageThresholds;
  massDisintegratePerformance?: PercentageThresholds;
}
interface ThresholdInfo {
  threshold?: number;
  message: string;
  performance: QualitativePerformance;
}
interface PercentageThresholds {
  perfect: ThresholdInfo;
  good?: ThresholdInfo;
  ok: ThresholdInfo;
  fail: ThresholdInfo;
}
interface TrackedCast {
  //Mass Disintegrate
  massDisintegrateTargets?: number;
  massDisintegrateTicks?: number;
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
  end: number;
}
interface WindowData {
  name: string;
  start: number;
  end: number;
  windowEndedOrPushed: boolean;
  casts?: TrackedCast[];
}

const SCALECOMMANDER_LOGIC: ChainClipLogic = {
  allowGoodClippingDragonrage: false,
  thresholdEarlyChainTicksDragonrage: 1,
  thresholdClipTicksDragonrage: 1,
  allowGoodClipping: false,
  thresholdEarlyChainTicks: 1,
  thresholdClipTicks: 1,
  regularPerformance: {
    perfect: {
      threshold: 1,
      message: 'You cast all Disintegrates correctly.',
      performance: QualitativePerformance.Perfect,
    },
    good: {
      threshold: 0.95,
      message: 'You cast most Disintegrates correctly.',
      performance: QualitativePerformance.Good,
    },
    ok: {
      threshold: 0.85,
      message: "You lost a few ticks when you shouldn't have.",
      performance: QualitativePerformance.Ok,
    },
    fail: {
      threshold: 0.0,
      message: "You lost a lot ticks when you shouldn't have.",
      performance: QualitativePerformance.Fail,
    },
  },
  dragonragePerformance: {
    perfect: {
      threshold: 1,
      message: 'You cast all Disintegrates correctly.',
      performance: QualitativePerformance.Perfect,
    },
    good: {
      threshold: 0.95,
      message: 'You cast most Disintegrates correctly.',
      performance: QualitativePerformance.Good,
    },
    ok: {
      threshold: 0.85,
      message: "You lost a few ticks when you shouldn't have.",
      performance: QualitativePerformance.Ok,
    },
    fail: {
      threshold: 0.0,
      message: "You lost a lot ticks when you shouldn't have.",
      performance: QualitativePerformance.Fail,
    },
  },
  massDisintegratePerformance: {
    perfect: {
      message: 'You cast all Mass Disintegrates correctly.',
      performance: QualitativePerformance.Perfect,
    },
    ok: {
      message: 'You lost some ticks, which is likely caused by mobs dying early.',
      performance: QualitativePerformance.Ok,
    },
    fail: {
      message: "You lost some ticks when you shouldn't have",
      performance: QualitativePerformance.Fail,
    },
  },
};
const FLAMESHAPER_LOGIC: ChainClipLogic = {
  allowGoodClippingDragonrage: true,
  thresholdEarlyChainTicksDragonrage: 1,
  thresholdClipTicksDragonrage: 1,
  allowGoodClipping: true,
  thresholdEarlyChainTicks: 1,
  thresholdClipTicks: 1,
  regularPerformance: {
    perfect: {
      threshold: 0.95,
      message: 'You cast all Disintegrates correctly.',
      performance: QualitativePerformance.Perfect,
    },
    good: {
      threshold: 0.9,
      message: 'You cast most Disintegrates correctly.',
      performance: QualitativePerformance.Good,
    },
    ok: {
      threshold: 0.8,
      message: "You lost a few ticks when you shouldn't have.",
      performance: QualitativePerformance.Ok,
    },
    fail: {
      threshold: 0.0,
      message: "You lost a lot ticks when you shouldn't have.",
      performance: QualitativePerformance.Fail,
    },
  },
  dragonragePerformance: {
    perfect: {
      threshold: 0.95,
      message: 'You cast all Disintegrates correctly.',
      performance: QualitativePerformance.Perfect,
    },
    good: {
      threshold: 0.9,
      message: 'You cast most Disintegrates correctly.',
      performance: QualitativePerformance.Good,
    },
    ok: {
      threshold: 0.8,
      message: "You lost a few ticks when you shouldn't have.",
      performance: QualitativePerformance.Ok,
    },
    fail: {
      threshold: 0.0,
      message: "You lost a lot ticks when you shouldn't have.",
      performance: QualitativePerformance.Fail,
    },
  },
};

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
class Disintegrate extends Analyzer {
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

  isScalecommander = this.selectedCombatant.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT);
  activeChainClipLogic = this.isScalecommander ? SCALECOMMANDER_LOGIC : FLAMESHAPER_LOGIC;

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
    chainClipStatus: ChainClipStatus.Cast,
    reason: '',
    timestamp: 0,
    end: 0,
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
    if (this.activeCast.tickCount > 0 && this.activeCast.end === 0) {
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
      if (this.activeCast.massDisintegrateTicks !== undefined)
        this.activeCast.massDisintegrateTicks += 1;
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

    if (this.isActiveCastMassDisintegrate()) {
      this.activeCast.massDisintegrateTargets = getDisintegrateTargetCount(event);
      this.activeCast.massDisintegrateTicks = 0;
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

    if (this.isActiveCastMassDisintegrate()) this.massDisintegrateSanityCheck(event);
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

    if (this.isActiveCastMassDisintegrate()) this.massDisintegrateSanityCheck(event);
  }

  private onRemoveDebuff(event: RemoveDebuffEvent) {
    // This is a fake removal ignore it
    if (HasRelatedEvent(event, DISINTEGRATE_REMOVE_APPLY)) {
      return;
    }

    this.activeCast.end = event.timestamp;

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

  private isActiveCastMassDisintegrate(): boolean {
    return this.activeCast.spellId === SPELLS.MASS_DISINTEGRATE_BUFF.id;
  }

  private RateCasts(casts: TrackedCast[]): TrackedCast[] {
    casts.forEach((cast, idx) => {
      if (
        cast.followingCast === SPELLS.MASS_DISINTEGRATE_BUFF.id ||
        cast.followingCast === SPELLS.DISINTEGRATE.id
      ) {
        // Cast has been chained
        if (cast.followingCast != cast.spellId) {
          cast.reason = 'Bad Chain: Chained Mass Disintegrate into Disintegrate';
        } else if (idx + 1 < casts.length && cast.mainTarget != casts[idx + 1].mainTarget) {
          cast.reason = 'Bad Chain: Swapped Targets';
        } else if (
          (cast.tickCount > this.activeChainClipLogic.thresholdEarlyChainTicks &&
            cast.spellId != SPELLS.MASS_DISINTEGRATE_BUFF.id) ||
          (cast.dragonRageActive &&
            cast.tickCount > this.activeChainClipLogic.thresholdEarlyChainTicksDragonrage &&
            cast.spellId != SPELLS.MASS_DISINTEGRATE_BUFF.id) ||
          (cast.tickCount > 1 && cast.spellId != SPELLS.MASS_DISINTEGRATE_BUFF.id)
        ) {
          cast.reason = `Bad Chain: Chained too early, clipping ${cast.tickCount - 1} tick(s).`;
        } else {
          cast.performance = QualitativePerformance.Good;
          cast.reason = 'Good Chain';
        }
        cast.chainClipStatus = ChainClipStatus.Chained;
      } else if (cast.followingCast && cast.tickCount >= 1) {
        // Cast has been clipped
        if (
          ((this.activeChainClipLogic.allowGoodClipping &&
            cast.tickCount <= this.activeChainClipLogic.thresholdClipTicksDragonrage) ||
            (this.activeChainClipLogic.allowGoodClippingDragonrage &&
              cast.tickCount <= this.activeChainClipLogic.thresholdClipTicksDragonrage &&
              cast.dragonRageActive)) &&
          this.goodClipSpellIds.includes(cast.followingCast) &&
          cast.spellId != SPELLS.MASS_DISINTEGRATE_BUFF.id
        ) {
          cast.performance = QualitativePerformance.Perfect;
          cast.reason = (
            <>
              Perfect Clip: Clipped with <SpellLink spell={cast.followingCast} />
            </>
          );
        } else if (
          this.isScalecommander &&
          cast.tickCount === 1 &&
          this.goodClipSpellIds.includes(cast.followingCast) &&
          cast.spellId != SPELLS.MASS_DISINTEGRATE_BUFF.id
        ) {
          // Checking target counts is a massive pain so we just add a general disclaimer and let people analyze it themselves.
          // Eventually I will try to add a more "sophisticated" solution.
          cast.performance = QualitativePerformance.Ok;
          cast.reason = (
            <>
              Ok Clip: Clipped {cast.tickCount} tick(s) with{' '}
              <SpellLink spell={cast.followingCast} />.
              {this.isScalecommander &&
                ' If target count was either 3 or 4 then it was GOOD else it was BAD.'}
            </>
          );
        } else {
          cast.reason = (
            <>
              Bad Clip: Clipped {cast.tickCount} tick(s) with{' '}
              <SpellLink spell={cast.followingCast} />
            </>
          );
        }
        cast.chainClipStatus = ChainClipStatus.Clipped;
      } else if (cast.tickCount >= 1) {
        cast.performance = QualitativePerformance.Fail;
        cast.reason = "Cancel: Don't cancel Disintegrate early.";
        cast.chainClipStatus = ChainClipStatus.Cancelled;
      } else {
        cast.performance = QualitativePerformance.Good;
        cast.reason = 'Good Cast';
      }
    });
    return casts;
  }

  private massDisintegrateSanityCheck(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const castEvent = getDisintegrateCast(event);
    if (castEvent === undefined)
      this.addDebugAnnotation(event, {
        color: BadColor,
        summary:
          'Found no targets for Mass Disintegrate. Known to be caused by instance recycling (Two Mobs in the log have the same ID)',
      });
  }

  private generateCastDistribution(casts: TrackedCast[]): AdditionalContent {
    let disintegrateCasts = 0,
      massDisintegrateCasts = 0;
    casts.forEach((c) => {
      if (c.massDisintegrateTicks === undefined) disintegrateCasts++;
      else massDisintegrateCasts++;
    });

    return {
      title: 'Cast Distribution',
      content: (
        <StackedBar
          segments={[
            {
              label: 'Disintegrate',
              value: disintegrateCasts,
              color: 'hsl(180, 70%, 55%)',
              tooltip: (
                <>
                  {disintegrateCasts} <SpellLink spell={SPELLS.DISINTEGRATE} /> cast.
                </>
              ),
            },
            {
              label: 'Mass Disintegrate',
              value: massDisintegrateCasts,
              color: 'hsl(220, 70%, 55%)',
              tooltip: (
                <>
                  {massDisintegrateCasts} <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} /> cast.
                </>
              ),
            },
          ]}
        />
      ),
    };
  }
  private generateChainDistribution(trackedCasts: TrackedCast[]): AdditionalContent {
    let chains = 0,
      clips = 0,
      casts = 0;
    trackedCasts.forEach((cast) => {
      if (cast.chainClipStatus === ChainClipStatus.Chained) chains++;
      else if (cast.chainClipStatus === ChainClipStatus.Clipped) clips++;
      else casts++;
    });

    return {
      title: 'Chain Distribution',
      content: (
        <StackedBar
          segments={[
            {
              label: 'Chains',
              value: chains,
              color: 'hsl(180, 70%, 55%)',
              tooltip: <>{chains} casts chained.</>,
            },
            {
              label: 'Clips',
              value: clips,
              color: 'hsl(200, 70%, 55%)',
              tooltip: <>{clips} casts clipped early.</>,
            },
            {
              label: 'Casts',
              value: casts,
              color: 'hsl(220, 70%, 55%)',
              tooltip: <>{casts} casts cast fully.</>,
            },
          ]}
        />
      ),
    };
  }
  private generateDisintegrateCastStats(casts: TrackedCast[]) {
    const regularTicks = { actual: 0, total: 0 },
      dragonRageTicks = { actual: 0, total: 0 },
      massDisintegrateTicks = { actual: 0, total: 0 },
      massDisintegrateTargets = { targets: 0, casts: 0 };

    casts.forEach((cast) => {
      if (cast.massDisintegrateTargets) {
        regularTicks.actual += cast.massDisintegrateTicks! + cast.maxTickCount - cast.tickCount;
        regularTicks.total += cast.massDisintegrateTargets * this.ticksPerDisintegrate;
        massDisintegrateTargets.targets += cast.massDisintegrateTargets;
        massDisintegrateTargets.casts++;
      } else if (cast.dragonRageActive) {
        dragonRageTicks.actual += cast.maxTickCount - cast.tickCount;
        dragonRageTicks.total += this.ticksPerDisintegrate;
        if (cast.preceedingCast === SPELLS.MASS_DISINTEGRATE_BUFF.id) {
          dragonRageTicks.actual--;
        }
      } else {
        massDisintegrateTicks.actual += cast.maxTickCount - cast.tickCount;
        massDisintegrateTicks.total += this.ticksPerDisintegrate;
        if (cast.preceedingCast === SPELLS.MASS_DISINTEGRATE_BUFF.id) {
          massDisintegrateTicks.actual--;
        }
      }
    });

    return {
      regularTicks,
      dragonRageTicks,
      massDisintegrateTicks,
      massDisintegrateTargets,
    };
  }
  private generateWindowStats(casts: TrackedCast[]): PerWindowStat[] {
    const stats = [];
    const castStats = this.generateDisintegrateCastStats(casts);

    if (castStats.regularTicks.total > 0) {
      const rating = this.resolveRegularTickPerformance(
        castStats.regularTicks.actual,
        castStats.regularTicks.total,
      );
      stats.push({
        label: 'Disintegrate Ticks',
        value: `${castStats.regularTicks.actual}/${castStats.regularTicks.total}`,
        performance: rating.performance,
        tooltip: rating.message,
      });
    }
    if (castStats.dragonRageTicks.total > 0) {
      const rating = this.resolveDragonRageTickPerformance(
        castStats.dragonRageTicks.actual,
        castStats.dragonRageTicks.total,
      );
      stats.push({
        label: 'Dragonrage Disintegrate Ticks',
        value: `${castStats.dragonRageTicks.actual}/${castStats.dragonRageTicks.total}`,
        performance: rating.performance,
        tooltip: rating.message,
      });
    }
    if (castStats.massDisintegrateTicks.total > 0) {
      const rating = this.resolveMassDisintegrateTickPerformance(
        castStats.massDisintegrateTicks.actual,
        castStats.massDisintegrateTicks.total,
        castStats.massDisintegrateTargets.targets,
        castStats.massDisintegrateTargets.casts,
      );
      stats.push({
        label: 'Mass Disintegrate Ticks',
        value: `${castStats.massDisintegrateTicks.actual}/${castStats.massDisintegrateTicks.total}`,
        performance: rating.performance,
        tooltip: rating.message,
      });
    }

    return stats;
  }
  private resolveRegularTickPerformance(actualTicks: number, totalTicks: number): ThresholdInfo {
    return this.resolvePerformanceBase(
      actualTicks,
      totalTicks,
      this.activeChainClipLogic.regularPerformance,
    );
  }
  private resolveDragonRageTickPerformance(actualTicks: number, totalTicks: number): ThresholdInfo {
    return this.resolvePerformanceBase(
      actualTicks,
      totalTicks,
      this.activeChainClipLogic.dragonragePerformance,
    );
  }
  private resolvePerformanceBase(
    actualTicks: number,
    totalTicks: number,
    thresholds: PercentageThresholds,
  ): ThresholdInfo {
    const percentage = actualTicks / totalTicks;
    const performanceThresholds: ThresholdInfo[] = Object.values(thresholds);
    for (const pt of performanceThresholds) {
      if (pt.threshold && percentage >= pt.threshold) {
        return pt;
      }
    }
    return thresholds.fail;
  }
  private resolveMassDisintegrateTickPerformance(
    actualTicks: number,
    totalTicks: number,
    targets: number,
    casts: number,
  ): ThresholdInfo {
    if (!this.activeChainClipLogic.massDisintegratePerformance)
      return {
        message:
          'You somehow managed to cast a Mass Disintegrate as Flameshaper. Congratulations ?',
        performance: QualitativePerformance.Perfect,
      };
    return actualTicks === totalTicks
      ? this.activeChainClipLogic.massDisintegratePerformance.perfect
      : targets / casts > 1
        ? this.activeChainClipLogic.massDisintegratePerformance.ok
        : this.activeChainClipLogic.massDisintegratePerformance.fail;
  }

  private generateTotalPerformance(stats: PerWindowStat[]): QualitativePerformance {
    let totalPerformanceRatio = 0;
    stats.forEach((stat) => {
      switch (stat.performance) {
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
    totalPerformanceRatio = Math.floor(totalPerformanceRatio / stats.length);

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
  /** Returns tick data for the entire fight */
  get tickData() {
    let casts: TrackedCast[] = [];
    this.windows.forEach((window) => {
      if (window.casts) {
        casts = casts.concat(window.casts);
      }
    });
    const castStats = this.generateDisintegrateCastStats(casts);
    return {
      regularTicks: castStats.regularTicks.actual,
      totalPossibleRegularTicks: castStats.regularTicks.total,
      regularTickPerformance: this.resolveRegularTickPerformance(
        castStats.regularTicks.actual,
        castStats.regularTicks.total,
      ).performance,
      dragonRageTicks: castStats.dragonRageTicks.actual,
      totalPossibleDragonRageTicks: castStats.dragonRageTicks.total,
      dragonRageTickPerformance: this.resolveDragonRageTickPerformance(
        castStats.dragonRageTicks.actual,
        castStats.dragonRageTicks.total,
      ).performance,
      massDisintegrateTicks: castStats.massDisintegrateTicks.actual,
      totalPossibleMassDisintegrateTicks: castStats.massDisintegrateTicks.total,
      massDisintegrateTickPerformance: this.resolveMassDisintegrateTickPerformance(
        castStats.massDisintegrateTicks.actual,
        castStats.massDisintegrateTicks.total,
        castStats.massDisintegrateTargets.targets,
        castStats.massDisintegrateTargets.casts,
      ).performance,
    };
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
                    precedingCast: c.preceedingCast,
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

        if (w.casts.find((c) => c.massDisintegrateTicks !== undefined))
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
          performance: this.generateTotalPerformance(stats),
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

export default Disintegrate;
