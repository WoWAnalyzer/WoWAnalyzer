import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { SubSection } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
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
import { SpellLink } from 'interface';
import {
  DISINTEGRATE_REMOVE_APPLY,
  getDisintegrateTargetCount,
  isFromMassDisintegrate,
  isMassDisintegrateDebuff,
  isMassDisintegrateTick,
} from '../normalizers/CastLinkNormalizer';
import { isMythicPlus } from 'common/isMythicPlus';
import { InformationIcon } from 'interface/icons';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';

const { DISINTEGRATE } = SPELLS;

const { DRAGONRAGE_TALENT } = TALENTS;

const TICKS_PER_DISINTEGRATE = 4;

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
 * Currently in 10.1.7 it is optimal to clip after third tick of Disintegrate inside of Dragonrage.
 * This counts both for chaining and and clipping casts.
 * It is however, currently, not a strong enough benefit to bonk people for not doing it.
 */

class Disintegrate extends Analyzer {
  /** Variables used for Clipping/Chaining efficiency */
  totalCasts: number = 0;
  totalTicks: number = 0;
  dragonRageTicks: number = 0;
  dragonRageCasts: number = 0;
  inDragonRageWindow: boolean = false;

  totalMassDisintegrateTargets = 0;
  totalMassDisintegrateTicks = 0;

  currentMainTarget = '';

  /** Variables used for graph */
  currentRemainingTicks: number = 0;
  isCurrentCastChained: boolean = false;
  disintegrateClipSpell: CastEvent | undefined = undefined;
  inFightWithDungeonBoss: boolean = false;

  fightStartTime: number = 0;
  fightEndTime: number = 0;

  /** Spells that you can/should clip with
   * Any other spell used to clip Disintegrate
   * is counted as a cancelled cast
   */
  trackedSpells = [
    SPELLS.LIVING_FLAME_CAST,
    SPELLS.FIRE_BREATH,
    SPELLS.FIRE_BREATH_FONT,
    SPELLS.ETERNITY_SURGE,
    SPELLS.ETERNITY_SURGE_FONT,
    TALENTS.TIP_THE_SCALES_TALENT,
    SPELLS.AZURE_STRIKE,
    TALENTS.SHATTERING_STAR_TALENT,
    TALENTS.PYRE_TALENT,
  ];

  graphData: GraphData[] = [];

  disintegrateTicksCounter: SpellTracker[] = [];
  disintegrateCasts: SpellTracker[] = [];
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
    /** Grab the spell we clipped with - this event always happens before the debuffRemove event
     * (Atleast for all the logs I've looked at so far) */
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.trackedSpells), (event) => {
      if (this.currentRemainingTicks > 0) {
        this.disintegrateClipSpell = event;
      }
    });

    this.addEventListener(Events.fightend, () => {
      /* console.log(this.totalMassDisintegrateTargets);
      console.log(this.totalMassDisintegrateTicks); */
      this.pushToGraphData();
    });
  }

  onApplyDragonrage(event: ApplyBuffEvent) {
    this.dragonrageBuffCounter.push({
      timestamp: event.timestamp,
      count: 5,
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
      this.totalMassDisintegrateTicks += 1;
      return;
    }

    this.totalTicks += 1;
    if (this.inDragonRageWindow) {
      this.dragonRageTicks += 1;
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
    if (isFromMassDisintegrate(event)) {
      this.totalMassDisintegrateTargets += getDisintegrateTargetCount(event) - 1;
    }

    this.totalCasts += 1;
    if (this.inDragonRageWindow) {
      this.dragonRageCasts += 1;
    }
  }

  get tickData() {
    const regularTicks = this.totalTicks - this.dragonRageTicks;
    const totalPossibleRegularTicks =
      (this.totalCasts - this.dragonRageCasts) * TICKS_PER_DISINTEGRATE;
    const dragonRageTicks = this.dragonRageTicks;
    const totalPossibleDragonRageTicks = this.dragonRageCasts * TICKS_PER_DISINTEGRATE;

    const totalPossibleMassDisintegrateTicks =
      this.totalMassDisintegrateTargets * TICKS_PER_DISINTEGRATE;

    return {
      regularTicks,
      totalPossibleRegularTicks,
      regularTickRatio: regularTicks / totalPossibleRegularTicks,
      dragonRageTicks,
      totalPossibleDragonRageTicks,
      dragonRageTickRatio: dragonRageTicks / totalPossibleDragonRageTicks,
      massDisintegrateTicks: this.totalMassDisintegrateTicks,
      totalPossibleMassDisintegrateTicks,
    };
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    if (isMassDisintegrateDebuff(event)) {
      return;
    }

    // This is actually a refresh event
    if (HasRelatedEvent(event, DISINTEGRATE_REMOVE_APPLY)) {
      this.onRefreshDebuff(event);
      return;
    }

    this.currentMainTarget = encodeEventTargetString(event);

    this.currentRemainingTicks = TICKS_PER_DISINTEGRATE;
    this.isCurrentCastChained = false;
    this.disintegrateClipSpell = undefined;

    this.disintegrateTicksCounter.push({
      timestamp: event.timestamp,
      count: this.currentRemainingTicks,
      tooltip: '',
    });

    this.disintegrateCasts.push({
      timestamp: event.timestamp,
      count: this.currentRemainingTicks,
      tooltip: 'Cast',
    });
  }

  onRefreshDebuff(event: RefreshDebuffEvent | ApplyDebuffEvent) {
    if (isMassDisintegrateDebuff(event)) {
      return;
    }
    // Clipped before GCD, very bad
    if (this.currentRemainingTicks >= (this.isCurrentCastChained ? 3 : 2)) {
      this.problemPoints.push({
        timestamp: event.timestamp,
        count: this.currentRemainingTicks,
        tooltip: 'Bad Chain, you chained before the 3rd tick.',
      });
    } // Clipped ticks outside of DR, bad - for TWW S1 this is optimal
    // In TWW S1 this is now optimal, will prolly become un-optimal again
    /* else if (!this.inDragonRageWindow && this.currentRemainingTicks > 1) {
      this.problemPoints.push({
        timestamp: event.timestamp,
        count: this.currentRemainingTicks,
        tooltip:
          'Bad Chain, you clipped: ' +
          (this.currentRemainingTicks - 1) +
          ' tick(s) outside of Dragonrage',
      });
    }  */
    else {
      this.disintegrateChainCasts.push({
        timestamp: event.timestamp,
        count: this.currentRemainingTicks,
        tooltip:
          this.currentRemainingTicks === 2
            ? 'Good Chain, you clipped: ' + (this.currentRemainingTicks - 1) + ` tick(s)`
            : 'Good Chain',
      });
    }

    this.isCurrentCastChained = true;
    /** Chained Disintegrate moves over one tick from current cast (Pandemic) */
    this.currentRemainingTicks = TICKS_PER_DISINTEGRATE + Math.min(this.currentRemainingTicks, 1);

    this.disintegrateTicksCounter.push({
      timestamp: event.timestamp,
      count: this.currentRemainingTicks,
    });

    this.disintegrateCasts.push({
      timestamp: event.timestamp,
      count: this.currentRemainingTicks,
      tooltip: 'Cast',
    });
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    // This is a fake removal ignore it
    if (HasRelatedEvent(event, DISINTEGRATE_REMOVE_APPLY)) {
      return;
    }

    if (this.currentMainTarget !== encodeEventTargetString(event)) {
      return;
    }

    /**
     * Here we wanna check if we clipped the Disintegrate to cast a higher
     * prio spell, this is currently optimal gameplay during Dragonrage
     */
    if (this.disintegrateClipSpell /*  && this.inDragonRageWindow */) {
      // Clipped before GCD, very bad
      if (this.currentRemainingTicks > (this.isCurrentCastChained ? 3 : 2)) {
        this.problemPoints.push({
          timestamp: event.timestamp,
          count: this.currentRemainingTicks,
          tooltip:
            'Bad Clip, you clipped with: ' +
            this.disintegrateClipSpell.ability.name +
            ' before the 3rd tick.',
        });
      } else {
        this.disintegrateClips.push({
          timestamp: event.timestamp,
          count: this.currentRemainingTicks,
          tooltip:
            'Good clip, you clipped: ' +
            this.currentRemainingTicks +
            ' tick(s) with: ' +
            this.disintegrateClipSpell.ability.name,
        });
      }
    } // We clipped outside of Dragonrage, bad
    // In TWW S1 this is now optimal, will prolly become un-optimal again
    else if (this.currentRemainingTicks >= 1) {
      /* if (this.disintegrateClipSpell) {
        this.problemPoints.push({
          timestamp: event.timestamp,
          count: this.currentRemainingTicks,
          tooltip:
            'Bad Clip, you clipped: ' +
            this.currentRemainingTicks +
            ' tick(s) outside of Dragonrage you clipped with: ' +
            this.disintegrateClipSpell.ability.name,
        });
      } // Straight cancelled Disintegrate, very bad - learn to use hover madge
      else { */
      this.problemPoints.push({
        timestamp: event.timestamp,
        count: this.currentRemainingTicks,
        tooltip: 'Cancelled channel, losing: ' + this.currentRemainingTicks + ' tick(s)',
      });
      /* } */
    }

    this.currentRemainingTicks = 0;
    this.disintegrateClipSpell = undefined;

    this.disintegrateTicksCounter.push({
      timestamp: event.timestamp,
      count: this.currentRemainingTicks,
      tooltip: '',
    });
  }

  /** Generate graph data */
  pushToGraphData() {
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
        spellTracker: this.disintegrateChainCasts,
        type: 'point',
        color: 'orange',
        label: 'Disintegrate Chain Casts',
      },
      {
        spellTracker: this.disintegrateClips,
        type: 'point',
        color: '#9b59b6',
        label: 'Disintegrate Clips',
      },
      {
        spellTracker: this.problemPoints,
        type: 'point',
        color: 'red',
        label: 'Problem Points',
      },
    ];

    /** If we are in a dungeon we only want to show the graph for bosses
     * So we split it up into multigraphs.
     */
    if (isMythicPlus(this.owner.fight)) {
      this.owner.fight.dungeonPulls?.forEach((dungeonPull) => {
        if (dungeonPull.boss) {
          const newGraphData = generateGraphData(
            dataSeries,
            dungeonPull.start_time,
            dungeonPull.end_time,
            dungeonPull.name,
          );
          this.graphData.push(newGraphData);
        }
      });
    } else {
      const newGraphData = generateGraphData(
        dataSeries,
        this.owner.fight.start_time,
        this.owner.fight.end_time,
      );
      this.graphData.push(newGraphData);
    }
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
      <SubSection title="Disintegrate">
        <div>
          Use the graph below to deep dive into your <SpellLink spell={DISINTEGRATE} /> casts.
          <ul>
            <li>
              Casts are highlighted in <span style={{ color: '#2ecc71' }}>green</span>
            </li>
            <li>
              Chained casts are highlighted in <span style={{ color: 'orange' }}>orange</span>
            </li>
            <li>
              Clipped casts are highlighted in <span style={{ color: '#9b59b6' }}>purple</span>
            </li>
            <li>
              Problem points are highlighted in <span style={{ color: 'red' }}>red</span>
            </li>
            <li>
              <SpellLink spell={DRAGONRAGE_TALENT} /> is shown as a filled in background.
            </li>
          </ul>
          <br />
          <b>
            <InformationIcon /> Mouseover each point on the graph for more detailed explanations.
          </b>
        </div>
        <ExplanationGraph
          fightStartTime={this.owner.fight.start_time}
          fightEndTime={this.owner.fight.end_time}
          graphData={this.graphData}
          yAxisName="Ticks"
        />
      </SubSection>
    );
  }
}

export default Disintegrate;
