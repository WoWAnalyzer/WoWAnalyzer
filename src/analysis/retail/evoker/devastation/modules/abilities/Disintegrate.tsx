import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { SubSection } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
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
import ExplanationGraph, {
  GraphData,
  DataSeries,
  SpellTracker,
  generateGraphData,
} from 'analysis/retail/evoker/shared/modules/components/ExplanationGraph';
import { SpellLink, TooltipElement } from 'interface';
import {
  DISINTEGRATE_REMOVE_APPLY,
  getDisintegrateCast,
  getDisintegrateTargetCount,
  isFromMassDisintegrate,
  isMassDisintegrateDebuff,
  isMassDisintegrateTick,
} from '../normalizers/CastLinkNormalizer';
import { InformationIcon } from 'interface/icons';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { GetDisintegrateTicks } from '../../constants';
import PassFailBar from 'interface/guide/components/PassFailBar';
import { BadColor } from 'interface/guide';
import { isMythicPlus } from 'common/isMythicPlus';

const { DISINTEGRATE } = SPELLS;
const { DRAGONRAGE_TALENT } = TALENTS;

const WINDOW_BUFFER = 500;

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

const defaultCastCounter = {
  DisintCasts: 0,
  DisintTicks: 0,
  DragonrageTicks: 0,
  DragonrageCasts: 0,
  MassDisintCasts: 0,
  MassDisintTicks: 0,
  MassDisintTargets: 0,
  MassDisintIntoDisChainTicks: 0, // This is here for one reason. Chaining Mass Dis into Disint will break the tick counters. This fixes that.
};
type CastCounter = typeof defaultCastCounter;

const defaultWindowData = {
  name: '',
  start: 0,
  end: 0,
  windowEndedOrPushed: false,
};
type WindowData = typeof defaultWindowData;

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

  activeChainClipLogic = this.selectedCombatant.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT)
    ? SCALECOMMANDER_LOGIC
    : FLAMESHAPER_LOGIC;

  isMythicPlus = isMythicPlus(this.owner.fight);

  inDragonRageWindow = false;
  currentMainTarget = '';
  currentRemainingTicks = 0;
  isCurrentCastChained = false;
  disintegrateClipSpell: CastEvent | BeginCastEvent | undefined = undefined;

  isPreviousCastMassDisintegrate = false;
  isCurrentCastMassDisintegrate = false;

  currentCastCounter: CastCounter = structuredClone(defaultCastCounter);
  totalCastCounter: CastCounter = structuredClone(defaultCastCounter);

  windowData: WindowData = structuredClone(defaultWindowData);
  pullData: WindowData[] = [];
  pullIndex = 0;

  graphData: GraphData[] = [];
  explanations: JSX.Element[] = [];

  disintegrateTicksCounter: SpellTracker[] = [];
  disintegrateCasts: SpellTracker[] = [];
  massDisintegrateCasts: SpellTracker[] = [];
  disintegrateChainCasts: SpellTracker[] = [];
  disintegrateClips: SpellTracker[] = [];
  problemPoints: SpellTracker[] = [];
  dragonrageBuffCounter: SpellTracker[] = [];

  constructor(options: Options) {
    super(options);

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

    this.ticksPerDisintegrate = GetDisintegrateTicks(this.selectedCombatant).disintegrateTicks;
    this.ticksPerChainedDisintegrate = GetDisintegrateTicks(
      this.selectedCombatant,
    ).disintegrateChainedTicks;

    if (this.isMythicPlus) {
      this.owner.fight.dungeonPulls?.forEach((dungeonPull) => {
        if (this.windowData.start === 0 && !dungeonPull.boss) {
          this.windowData = {
            start: dungeonPull.start_time,
            end: 0,
            windowEndedOrPushed: true, // Mark Trash pulls as EndedorPushed to exclude them
            name: 'Trash',
          };
        }
        if (dungeonPull.boss) {
          this.windowData.end = dungeonPull.start_time;
          this.pullData.push(this.windowData);
          this.windowData = {
            start: dungeonPull.start_time,
            end: 0,
            windowEndedOrPushed: false,
            name: dungeonPull.name,
          };
          this.pullData.push(this.windowData);
          this.windowData = structuredClone(defaultWindowData);
        }
      });
    }
  }

  /** Grab the spell we clipped with - this event always happens before the debuffRemove event
   * (Atleast for all the logs I've looked at so far) */
  onGeneralCast(event: CastEvent | BeginCastEvent) {
    if (this.currentRemainingTicks > 0) {
      this.disintegrateClipSpell = event;
    }

    if (this.currentRemainingTicks === 0) this.finishRecordingWindow(event);
  }

  onApplyDragonrage(event: ApplyBuffEvent) {
    if (!this.isMythicPlus) {
      if (this.windowData.start !== 0) {
        this.windowData.end = event.timestamp;
        this.pushToGraphData(this.windowData);
      }
      this.windowData = {
        start: event.timestamp,
        end: 0,
        windowEndedOrPushed: false,
        name: 'Window',
      };
    }
    this.dragonrageBuffCounter.push({
      timestamp: event.timestamp,
      count: this.ticksPerChainedDisintegrate,
      tooltip: '',
    });
    this.inDragonRageWindow = true;
  }

  onRemoveDragonrage(event: RemoveBuffEvent) {
    this.dragonrageBuffCounter.push({
      timestamp: event.timestamp,
      count: 0,
      tooltip: '',
    });
    this.inDragonRageWindow = false;

    if (!this.isMythicPlus) {
      this.windowData.windowEndedOrPushed = true;
    }
  }

  onDisintegrateTick(event: DamageEvent) {
    if (isMassDisintegrateTick(event)) {
      this.currentCastCounter.MassDisintTicks += 1;
      return;
    }

    if (this.isCurrentCastMassDisintegrate) {
      this.currentCastCounter.MassDisintTicks += 1;
    } else {
      this.currentCastCounter.DisintTicks += 1;
      if (this.inDragonRageWindow) {
        this.currentCastCounter.DragonrageTicks += 1;
      }
    }

    // This should not happen but w/e
    if (this.currentRemainingTicks === 0) {
      return;
    }
    this.currentRemainingTicks -= 1;

    this.disintegrateTicksCounter.push({
      timestamp: event.timestamp,
      count: this.currentRemainingTicks,
      tooltip: '',
    });
  }

  onDisintegrateCast(event: CastEvent) {
    if (this.currentRemainingTicks === 0) this.finishRecordingWindow(event);
    const isMassDisintegrate = isFromMassDisintegrate(event);
    this.isPreviousCastMassDisintegrate = this.isCurrentCastMassDisintegrate;
    this.isCurrentCastMassDisintegrate = isMassDisintegrate;

    if (isMassDisintegrate) {
      this.currentCastCounter.MassDisintTargets += getDisintegrateTargetCount(event);
      this.currentCastCounter.MassDisintCasts += 1;
    } else {
      this.currentCastCounter.DisintCasts += 1;
      if (this.inDragonRageWindow) {
        this.currentCastCounter.DragonrageCasts += 1;
      }
    }
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    if (isMassDisintegrateDebuff(event)) {
      return;
    }

    // This is actually a refresh event or chained cast
    if (HasRelatedEvent(event, DISINTEGRATE_REMOVE_APPLY)) {
      this.onRefreshDebuff(event);
      return;
    }

    this.currentMainTarget = encodeEventTargetString(event);

    this.currentRemainingTicks = this.ticksPerDisintegrate;
    this.isCurrentCastChained = false;
    this.disintegrateClipSpell = undefined;

    this.disintegrateTicksCounter.push({
      timestamp: event.timestamp,
      count: this.currentRemainingTicks,
      tooltip: '',
    });

    if (this.isCurrentCastMassDisintegrate) {
      this.massDisintegrateCastInsert(event);
    } else {
      this.disintegrateCasts.push({
        timestamp: event.timestamp,
        count: this.currentRemainingTicks,
        tooltip: 'Cast',
      });
    }
  }

  onRefreshDebuff(event: RefreshDebuffEvent | ApplyDebuffEvent) {
    if (isMassDisintegrateDebuff(event)) {
      return;
    }

    this.currentMainTarget = encodeEventTargetString(event);

    // Fixes the edgecase where the last tick and the new cast fall on the same timestamp resulting in a fake refreshdebuff event.
    if (this.currentRemainingTicks > 0) {
      // Mass Disintegrate Checks
      if (this.isCurrentCastMassDisintegrate) {
        if (this.currentRemainingTicks > 2) {
          this.problemPoints.push({
            timestamp: event.timestamp,
            count: this.currentRemainingTicks,
            tooltip: 'Bad Chain, you clipped: ' + (this.currentRemainingTicks - 1) + ' tick(s)',
          });
        } else {
          this.disintegrateChainCasts.push({
            timestamp: event.timestamp,
            count: this.currentRemainingTicks,
            tooltip: 'Good Chain',
          });
        }
      }
      // Early Chain
      else if (
        (this.inDragonRageWindow &&
          this.currentRemainingTicks >
            this.activeChainClipLogic.thresholdEarlyChainTicksDragonrage) ||
        (!this.inDragonRageWindow &&
          this.currentRemainingTicks > this.activeChainClipLogic.thresholdEarlyChainTicks)
      ) {
        this.problemPoints.push({
          timestamp: event.timestamp,
          count: this.currentRemainingTicks,
          tooltip:
            'Bad Chain, you clipped: ' +
            (this.currentRemainingTicks - 1) +
            ' tick(s) ' +
            `${this.inDragonRageWindow ? 'during Dragonrage' : 'outside Dragonrage'}`,
        });
      }
      // Chained Mass Dis into Dis
      else if (this.isPreviousCastMassDisintegrate) {
        this.problemPoints.push({
          timestamp: event.timestamp,
          count: this.currentRemainingTicks,
          tooltip: 'Bad Chain, chained Mass Disintegrate into Disintegrate',
        });
        this.currentCastCounter.MassDisintIntoDisChainTicks += 1;
      }
      // Good Chain
      else
        this.disintegrateChainCasts.push({
          timestamp: event.timestamp,
          count: this.currentRemainingTicks,
          tooltip:
            this.currentRemainingTicks >= 2
              ? 'Good Chain, you clipped: ' + (this.currentRemainingTicks - 1) + ` tick(s)`
              : 'Good Chain',
        });

      this.isCurrentCastChained = true;
    }

    /** Chained Disintegrate moves over one tick from current cast (Pandemic) */
    this.currentRemainingTicks =
      this.ticksPerDisintegrate + Math.min(this.currentRemainingTicks, 1);

    this.disintegrateTicksCounter.push({
      timestamp: event.timestamp,
      count: this.currentRemainingTicks,
    });

    if (this.isCurrentCastMassDisintegrate) {
      this.massDisintegrateCastInsert(event);
    } else {
      this.disintegrateCasts.push({
        timestamp: event.timestamp,
        count: this.currentRemainingTicks,
        tooltip: 'Cast',
      });
    }
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    // This is a fake removal ignore it
    if (HasRelatedEvent(event, DISINTEGRATE_REMOVE_APPLY)) {
      return;
    }

    if (this.currentMainTarget !== encodeEventTargetString(event)) {
      return;
    }

    // Clipping related checks
    if (this.disintegrateClipSpell) {
      // Bad Clip - Too many ticks
      if (
        (this.inDragonRageWindow &&
          this.currentRemainingTicks >
            this.activeChainClipLogic.thresholdClipTicksDragonrage + 1) ||
        (!this.inDragonRageWindow &&
          this.currentRemainingTicks > this.activeChainClipLogic.thresholdClipTicks + 1)
      ) {
        this.problemPoints.push({
          timestamp: event.timestamp,
          count: this.currentRemainingTicks,
          tooltip:
            'Bad Clip, you clipped: ' +
            this.currentRemainingTicks +
            ' tick(s) ' +
            `${this.inDragonRageWindow ? 'during Dragonrage' : 'outside Dragonrage'}` +
            ' with: ' +
            this.disintegrateClipSpell.ability.name,
        });
      }
      // Good Clip - Correct Spell
      else if (
        (this.inDragonRageWindow &&
          this.activeChainClipLogic.allowGoodClippingDragonrage &&
          this.goodClipSpellIds.includes(this.disintegrateClipSpell.ability.guid)) ||
        (!this.inDragonRageWindow &&
          this.activeChainClipLogic.allowGoodClipping &&
          this.goodClipSpellIds.includes(this.disintegrateClipSpell.ability.guid))
      ) {
        this.disintegrateClips.push({
          timestamp: event.timestamp,
          count: this.currentRemainingTicks,
          tooltip:
            'Good clip, you clipped: ' +
            this.currentRemainingTicks +
            ' tick(s) ' +
            `${this.inDragonRageWindow ? 'during Dragonrage' : 'outside Dragonrage'}` +
            ' with: ' +
            this.disintegrateClipSpell.ability.name,
        });
      }
      // Bad Clip - Wrong Spell
      else {
        this.problemPoints.push({
          timestamp: event.timestamp,
          count: this.currentRemainingTicks,
          tooltip:
            'Bad Clip, you clipped: ' +
            this.currentRemainingTicks +
            ' tick(s) ' +
            `${this.inDragonRageWindow ? 'during Dragonrage' : 'outside Dragonrage'}` +
            ' with: ' +
            this.disintegrateClipSpell.ability.name,
        });
      }
    }
    // Cancelled Channel
    else if (this.currentRemainingTicks > 1) {
      this.problemPoints.push({
        timestamp: event.timestamp,
        count: this.currentRemainingTicks,
        tooltip: 'Cancelled channel, losing: ' + this.currentRemainingTicks + ' tick(s)',
      });
    }

    this.currentRemainingTicks = 0;
    this.disintegrateClipSpell = undefined;

    this.disintegrateTicksCounter.push({
      timestamp: event.timestamp,
      count: this.currentRemainingTicks,
      tooltip: '',
    });
  }

  onFightEnd(event: FightEndEvent) {
    // Pushes remaining windows
    if (this.isMythicPlus) {
      if (!this.pullData[this.pullIndex].windowEndedOrPushed) {
        this.pullData[this.pullIndex].end = event.timestamp;
        this.pushToGraphData(this.pullData[this.pullIndex]);
      }
    } else {
      this.windowData.end = event.timestamp;
      this.pushToGraphData(this.windowData);
    }

    // Sanity Checks
    if (
      this.totalCastCounter.MassDisintTicks >
      this.totalCastCounter.MassDisintTargets * this.ticksPerDisintegrate
    ) {
      this.addDebugAnnotation(event, {
        color: BadColor,
        summary: `More Mass Disintegrate Ticks than possible. (${this.totalCastCounter.MassDisintTicks}/${this.totalCastCounter.MassDisintTargets * this.ticksPerDisintegrate}). See other annotations for a likely cause`,
      });
    }
  }

  private finishRecordingWindow(event: CastEvent | BeginCastEvent | ApplyDebuffEvent) {
    // Check if the pull/dragonrage window has ended
    if (!this.isMythicPlus && this.windowData.windowEndedOrPushed) {
      this.windowData.end = event.timestamp;
      this.pushToGraphData(this.windowData);
      this.windowData = {
        start: event.timestamp,
        end: 0,
        windowEndedOrPushed: false,
        name: 'Window',
      };
    } else if (
      this.isMythicPlus &&
      this.pullIndex < this.pullData.length - 1 &&
      event.timestamp > this.pullData[this.pullIndex + 1].start
    ) {
      this.pullData[this.pullIndex].end = event.timestamp;
      if (!this.pullData[this.pullIndex].windowEndedOrPushed)
        this.pushToGraphData(this.pullData[this.pullIndex]);
      // Pulls don't care if Dragonrage is still running so we need to push another "start" for the graph to show the window
      if (this.inDragonRageWindow) {
        this.dragonrageBuffCounter.push({
          timestamp: this.pullData[this.pullIndex + 1].start - WINDOW_BUFFER,
          count: this.ticksPerChainedDisintegrate,
          tooltip: '',
        });
      }
      this.pullIndex++;
    }
  }

  private massDisintegrateCastInsert(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const castEvent = getDisintegrateCast(event);
    if (castEvent !== undefined) {
      const targets = getDisintegrateTargetCount(castEvent);

      this.massDisintegrateCasts.push({
        timestamp: event.timestamp,
        count: this.currentRemainingTicks,
        tooltip: `Mass Disintegrate Cast: ${targets} target(s)`,
      });
    } else {
      this.massDisintegrateCasts.push({
        timestamp: event.timestamp,
        count: this.currentRemainingTicks,
        tooltip: `Mass Disintegrate Cast`,
      });
      this.addDebugAnnotation(event, {
        color: BadColor,
        summary:
          'Found no targets for Mass Disintegrate. Known to be caused by instance recycling (Two Mobs in the log have the same ID)',
      });
    }
  }

  /** Generate graph data and clear all trackers for next window.*/
  pushToGraphData(windowData: WindowData) {
    windowData.windowEndedOrPushed = true;

    /** Create our dataSeries*/
    const dataSeries: DataSeries[] = [
      {
        spellTracker: this.dragonrageBuffCounter,
        type: 'area',
        color: '#CCCCCC',
        label: 'Dragonrage',
      },
      {
        spellTracker: this.disintegrateTicksCounter,
        type: 'line',
        color: '#4C78A8',
        label: 'Disintegrate Ticks',
      },
      {
        spellTracker: this.disintegrateCasts,
        type: 'point',
        color: '#2ecc71',
        label: 'Disintegrate Casts',
      },
      {
        spellTracker: this.massDisintegrateCasts,
        type: 'point',
        color: '#aa774f',
        label: 'Mass Disintegrate Casts',
      },
      {
        spellTracker: this.disintegrateChainCasts,
        type: 'point',
        color: 'orange',
        label: 'Chain Casts',
      },
      {
        spellTracker: this.disintegrateClips,
        type: 'point',
        color: '#9b59b6',
        label: 'Clips',
      },
      {
        spellTracker: this.problemPoints,
        type: 'point',
        color: 'red',
        label: 'Problem Points',
      },
    ];

    /** If no Disintegrates were used push an empty div instead of nothing to preserve formatting */
    const content =
      this.disintegrateTicksCounter.length === 0 ? (
        <div></div>
      ) : (
        <>
          <table className="graph-explanations">
            <tbody>
              <tr>
                <td>
                  <strong>Summary</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <SpellLink spell={SPELLS.DISINTEGRATE} /> Casts
                </td>
                <td>{this.currentCastCounter.DisintCasts} cast(s)</td>
              </tr>
              {this.currentCastCounter.MassDisintCasts > 0 && (
                <tr>
                  <td>
                    <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} /> Casts
                  </td>
                  <td>{this.currentCastCounter.MassDisintCasts} cast(s)</td>
                </tr>
              )}
              {this.disintegrateChainCasts.length > 0 && (
                <tr>
                  <td>Chains</td>
                  <td>{this.disintegrateChainCasts.length} chain(s)</td>
                </tr>
              )}
              {this.disintegrateClips.length > 0 && (
                <tr>
                  <td>Clips</td>
                  <td>{this.disintegrateClips.length} clip(s)</td>
                </tr>
              )}
              {this.problemPoints.length > 0 && (
                <tr>
                  <td>Problem Points</td>
                  <td>{this.problemPoints.length} problem(s)</td>
                </tr>
              )}
            </tbody>
            <tbody>
              <tr>
                <td>
                  <strong>Tick Usage</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <SpellLink spell={SPELLS.DISINTEGRATE} />
                </td>
                <td>
                  {this.currentCastCounter.DisintTicks -
                    this.currentCastCounter.MassDisintIntoDisChainTicks}
                  /{this.currentCastCounter.DisintCasts * this.ticksPerDisintegrate}
                </td>
                <td>
                  <PassFailBar
                    pass={
                      this.currentCastCounter.DisintTicks -
                      this.currentCastCounter.MassDisintIntoDisChainTicks
                    }
                    total={this.currentCastCounter.DisintCasts * this.ticksPerDisintegrate}
                  />
                </td>
              </tr>
              {this.currentCastCounter.MassDisintTicks > 0 && (
                <tr>
                  <td>
                    <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} />
                  </td>
                  {this.currentCastCounter.MassDisintTicks <
                  this.currentCastCounter.MassDisintTargets * this.ticksPerDisintegrate ? (
                    <td>
                      <TooltipElement
                        content={
                          <>
                            Losing ticks on <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} />,
                            despite having no problem points, might be caused by mobs dying, which
                            is unavoidable.
                          </>
                        }
                      >
                        {this.currentCastCounter.MassDisintTicks}/
                        {this.currentCastCounter.MassDisintTargets * this.ticksPerDisintegrate}
                      </TooltipElement>
                    </td>
                  ) : (
                    <>
                      {this.currentCastCounter.MassDisintTicks}/
                      {this.currentCastCounter.MassDisintTargets * this.ticksPerDisintegrate}
                    </>
                  )}
                  <td>
                    <PassFailBar
                      pass={this.currentCastCounter.MassDisintTicks}
                      total={this.currentCastCounter.MassDisintTargets * this.ticksPerDisintegrate}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      );
    this.explanations.push(content);

    const newGraphData = generateGraphData(
      dataSeries,
      windowData.start - WINDOW_BUFFER,
      windowData.end + WINDOW_BUFFER,
      windowData.name,
      this.disintegrateTicksCounter.length === 0 ? (
        <div>
          You didn't use <SpellLink spell={DISINTEGRATE} />
        </div>
      ) : undefined,
    );
    this.graphData.push(newGraphData);

    this.totalCastCounter.DisintCasts += this.currentCastCounter.DisintCasts;
    this.totalCastCounter.DisintTicks += this.currentCastCounter.DisintTicks;
    this.totalCastCounter.DragonrageCasts += this.currentCastCounter.DragonrageCasts;
    this.totalCastCounter.DragonrageTicks += this.currentCastCounter.DragonrageTicks;
    this.totalCastCounter.MassDisintCasts += this.currentCastCounter.MassDisintCasts;
    this.totalCastCounter.MassDisintTicks += this.currentCastCounter.MassDisintTicks;
    this.totalCastCounter.MassDisintTargets += this.currentCastCounter.MassDisintTargets;
    this.totalCastCounter.MassDisintIntoDisChainTicks +=
      this.currentCastCounter.MassDisintIntoDisChainTicks;

    this.currentCastCounter = structuredClone(defaultCastCounter);

    this.disintegrateTicksCounter = [];
    this.disintegrateCasts = [];
    this.massDisintegrateCasts = [];
    this.disintegrateChainCasts = [];
    this.disintegrateClips = [];
    this.problemPoints = [];
    this.dragonrageBuffCounter = [];
  }

  /** Returns tick data for the entire fight */
  get tickData() {
    const regularTicks = this.totalCastCounter.DisintTicks - this.totalCastCounter.DragonrageTicks;
    const totalPossibleRegularTicks =
      (this.totalCastCounter.DisintCasts - this.totalCastCounter.DragonrageCasts) *
      this.ticksPerDisintegrate;
    const dragonRageTicks = this.totalCastCounter.DragonrageTicks;
    const totalPossibleDragonRageTicks =
      this.totalCastCounter.DragonrageCasts * this.ticksPerDisintegrate;

    const totalPossibleMassDisintegrateTicks =
      this.totalCastCounter.MassDisintTargets * this.ticksPerDisintegrate;

    const massDisintTicks = Math.min(
      this.totalCastCounter.MassDisintTicks,
      totalPossibleMassDisintegrateTicks,
    );

    return {
      regularTicks,
      totalPossibleRegularTicks,
      regularTickRatio: regularTicks / totalPossibleRegularTicks,
      dragonRageTicks,
      totalPossibleDragonRageTicks,
      dragonRageTickRatio: dragonRageTicks / totalPossibleDragonRageTicks,
      massDisintegrateTicks: massDisintTicks,
      totalPossibleMassDisintegrateTicks,
    };
  }

  /** Evaluate individual disintegrate casts */
  guideSubSection(): JSX.Element | null {
    /**
     * Don't show graph if we don't have anything to show
     */
    if (!this.active || this.graphData.length === 0) {
      return null;
    }

    return (
      <SubSection title="Cast Analysis">
        <div>
          <p>
            For further analysis, use the graph below to deep dive into your{' '}
            <SpellLink spell={DISINTEGRATE} /> casts.{' '}
            {this.isMythicPlus ? (
              <>
                The windows of casts are seperated into boss pulls. The time between them gets
                excluded as its not useful for analysis.
              </>
            ) : (
              <>
                The windows of casts are seperated into Dragonrage windows and the time between
                them.
              </>
            )}
          </p>
          <table>
            <tbody>
              <tr>
                <td width={150}>
                  <strong>Legend </strong>
                </td>
              </tr>
              <tr>
                <td>
                  <span style={{ backgroundColor: '#2ecc71', color: 'Black', padding: '0 3px' }}>
                    Green
                  </span>
                </td>
                <td>Disintegrate Cast</td>
              </tr>
              {this.selectedCombatant.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT) && (
                <tr>
                  <td>
                    <span style={{ backgroundColor: '#aa774f', color: 'White', padding: '0 3px' }}>
                      Brown
                    </span>
                  </td>
                  <td>Mass Disintegrate Cast</td>
                </tr>
              )}
              <tr>
                <td>
                  <span style={{ backgroundColor: 'orange', color: 'Black', padding: '0 3px' }}>
                    Orange
                  </span>
                </td>
                <td>Chained Casts</td>
              </tr>
              <tr>
                <td>
                  <span style={{ backgroundColor: '#9b59b6', color: 'White', padding: '0 3px' }}>
                    Purple
                  </span>
                </td>
                <td>Clipped Casts</td>
              </tr>
              <tr>
                <td>
                  <span style={{ backgroundColor: 'red', color: 'White', padding: '0 3px' }}>
                    Red
                  </span>
                </td>
                <td>Problem Points</td>
              </tr>
              <tr>
                <td>
                  <span style={{ backgroundColor: 'white', color: 'Black', padding: '0 3px' }}>
                    White Background
                  </span>
                </td>
                <td>Dragonrage Windows</td>
              </tr>
            </tbody>
          </table>
          <b>
            <InformationIcon /> Mouseover each point on the graph for more detailed
            explanations.{' '}
          </b>
        </div>
        <ExplanationGraph
          fightStartTime={this.owner.fight.start_time}
          fightEndTime={this.owner.fight.end_time}
          graphData={this.graphData}
          yAxisName="Remaining Ticks"
          explanations={this.explanations}
          noLegend={true}
        />
      </SubSection>
    );
  }
}

export default Disintegrate;
