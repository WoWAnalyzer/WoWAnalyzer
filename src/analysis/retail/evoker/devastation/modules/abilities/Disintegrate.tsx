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

const { DISINTEGRATE } = SPELLS;
const { DRAGONRAGE_TALENT } = TALENTS;

const CHAIN_WINDOW_BUFFER = 500;
const CHAIN_WINDOW_BATCH_MINIMUM = 3;

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

interface CastCounter {
  DisintCasts: number;
  DisintTicks: number;
  DragonrageTicks: number;
  DragonrageCasts: number;
  MassDisintCasts: number;
  MassDisintTicks: number;
  MassDisintTargets: number;
  MassDisintIntoDisChainTicks: number; // This is here for one reason. Chaining Mass Dis into Disint will break the tick counters. This fixes that.
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
  ]; // The idea behind this change is that the spells are used to generate a tooltip in the guide. Only the ids wouldn't work for that afaik.

  ticksPerDisintegrate = 0;
  ticksPerChainedDisintegrate = 0;

  activeChainClipLogic: ChainClipLogic = {} as ChainClipLogic;

  /** Variables used for graph */
  inDragonRageWindow = false;
  currentMainTarget = '';
  currentRemainingTicks = 0;
  isCurrentCastChained = false;
  disintegrateClipSpell: CastEvent | BeginCastEvent | undefined = undefined;
  inFightWithDungeonBoss = false;

  fightStartTime = 0;
  fightEndTime = 0;

  isPreviousCastMassDisintegrate = false;
  isCurrentCastMassDisintegrate = false;

  currentCastCounter: CastCounter = {
    DisintCasts: 0,
    DisintTicks: 0,
    DragonrageTicks: 0,
    DragonrageCasts: 0,
    MassDisintCasts: 0,
    MassDisintTicks: 0,
    MassDisintTargets: 0,
    MassDisintIntoDisChainTicks: 0,
  };

  chainWindowStart = 0;
  chainWindowCount = 0;
  chainWindowEnd = 0;

  graphData: GraphData[] = [];
  explanations: JSX.Element[] = [];

  disintegrateTicksCounter: SpellTracker[] = [];
  disintegrateCasts: SpellTracker[] = [];
  massDisintegrateCasts: SpellTracker[] = [];
  disintegrateChainCasts: SpellTracker[] = [];
  disintegrateClips: SpellTracker[] = [];
  problemPoints: SpellTracker[] = [];
  dragonrageBuffCounter: SpellTracker[] = [];

  /** Variables used for Clipping/Chaining efficiency */
  totalCastCounter: CastCounter = {
    DisintCasts: 0,
    DisintTicks: 0,
    DragonrageTicks: 0,
    DragonrageCasts: 0,
    MassDisintCasts: 0,
    MassDisintTicks: 0,
    MassDisintTargets: 0,
    MassDisintIntoDisChainTicks: 0,
  };

  constructor(options: Options) {
    super(options);

    // Select logic based on hero talent
    if (this.selectedCombatant.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT))
      this.activeChainClipLogic = SCALECOMMANDER_LOGIC;
    else this.activeChainClipLogic = FLAMESHAPER_LOGIC;

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

    /** Grab the spell we clipped with - this event always happens before the debuffRemove event
     * (Atleast for all the logs I've looked at so far) */
    [Events.cast, Events.begincast].forEach((type) =>
      this.addEventListener(type.by(SELECTED_PLAYER).spell(this.trackedSpells), (event) => {
        if (this.currentRemainingTicks > 0) {
          this.disintegrateClipSpell = event;
        }
      }),
    );

    this.addEventListener(Events.fightend, (e) => {
      // Pushes remaining windows
      this.pushToGraphData(e.timestamp);
    });

    this.ticksPerDisintegrate = GetDisintegrateTicks(this.selectedCombatant).disintegrateTicks;
    this.ticksPerChainedDisintegrate = GetDisintegrateTicks(
      this.selectedCombatant,
    ).disintegrateChainedTicks;
  }

  onApplyDragonrage(event: ApplyBuffEvent) {
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
    // Need to do this here instead of onRemoveDebuff because ending a window in a Mass Dis cast would lose ticks (Mass Dis ticks fire after the removeDebuff)
    if (this.chainWindowEnd !== 0) {
      this.pushToGraphData(this.chainWindowEnd);
      this.chainWindowEnd = 0;
    }

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

    if (this.chainWindowCount === 0) {
      // Doing this here to remove Dragonrage events that ended between 2 windows
      this.dragonrageBuffCounter = [];

      this.chainWindowStart = event.timestamp;

      // Since we are creating windows we have to reenable the Dragonrage Buff if it was already active
      if (this.inDragonRageWindow) {
        this.dragonrageBuffCounter.push({
          timestamp: event.timestamp - CHAIN_WINDOW_BUFFER,
          count: this.ticksPerChainedDisintegrate,
          tooltip: '',
        });
      }
    }
    this.chainWindowCount += 1;
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

    this.chainWindowCount += 1;
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
          this.goodClipSpells.find(
            (spell) => spell.id === this.disintegrateClipSpell?.ability.guid,
          ) !== undefined) ||
        (!this.inDragonRageWindow &&
          this.activeChainClipLogic.allowGoodClipping &&
          this.goodClipSpells.find(
            (spell) => spell.id === this.disintegrateClipSpell?.ability.guid,
          ) !== undefined)
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

    if (this.chainWindowCount >= CHAIN_WINDOW_BATCH_MINIMUM) {
      this.chainWindowEnd = event.timestamp;
      this.chainWindowCount = 0;
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
    }
  }

  /** Generate graph data and clear all trackers for next window.*/
  pushToGraphData(timestamp: number) {
    // don't generate graph data if Disintegrate hasn't been used.
    if (this.disintegrateTicksCounter.length === 0) {
      return;
    }

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

    const content = (
      <>
        <table className="graph-explanations">
          <tbody>
            <tr>
              <td>
                <strong>General</strong>
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
          </tbody>
          <tbody>
            <tr>
              <td>
                <strong>Tick Usage</strong>
              </td>
            </tr>
            <tr>
              <td>
                <SpellLink spell={SPELLS.DISINTEGRATE} /> Efficiency
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
                  <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} /> Efficiency
                </td>
                <td>
                  <TooltipElement
                    content={
                      <>
                        Losing ticks on <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} />, despite
                        having no problem points, might be caused by mobs dying, which is
                        unavoidable.
                      </>
                    }
                  >
                    {this.currentCastCounter.MassDisintTicks}/
                    {this.currentCastCounter.MassDisintTargets * this.ticksPerDisintegrate}
                  </TooltipElement>
                </td>
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
      this.chainWindowStart - CHAIN_WINDOW_BUFFER,
      timestamp + CHAIN_WINDOW_BUFFER,
      'Chain Window',
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

    this.currentCastCounter = {
      DisintCasts: 0,
      DisintTicks: 0,
      DragonrageTicks: 0,
      DragonrageCasts: 0,
      MassDisintCasts: 0,
      MassDisintTicks: 0,
      MassDisintTargets: 0,
      MassDisintIntoDisChainTicks: 0,
    };

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

    return {
      regularTicks,
      totalPossibleRegularTicks,
      regularTickRatio: regularTicks / totalPossibleRegularTicks,
      dragonRageTicks,
      totalPossibleDragonRageTicks,
      dragonRageTickRatio: dragonRageTicks / totalPossibleDragonRageTicks,
      massDisintegrateTicks: this.totalCastCounter.MassDisintTicks,
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
            <SpellLink spell={DISINTEGRATE} /> casts. For the sake of simplicity the casts are
            batched into groups which preserve chains and contain at least 3 casts .
          </p>
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
        />
      </SubSection>
    );
  }
}

export default Disintegrate;
