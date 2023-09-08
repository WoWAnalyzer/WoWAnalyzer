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
import DisintegratePlot from './DisintegrateGraph';
import { SpellLink } from 'interface';
import { DISINTEGRATE_REMOVE_APPLY } from '../normalizers/CastLinkNormalizer';

const { DISINTEGRATE } = SPELLS;

const { DRAGONRAGE_TALENT } = TALENTS;

const TICKS_PER_DISINTEGRATE = 4;

export type SpellTracker = {
  timestamp: number;
  count: number;
  tooltip: string;
};

/**
 * Disintegrate is Devastation's ST spender, it is one of the primary focus points of your rotation.
 * Since Devastation's damage kit is rather small, the importance of playing well around the few spells
 * you have in your rotation is very important.
 *
 * This module aims to provide the user with a simple, easy and detailed way to analysis their overall
 * effeciency, as well as the ability to deepdive into individual casts.
 *
 * The first part of the module provides quick feedback regarding cast effeciencies based on current APL.
 * This part provides feedback on on dropped ticks inside and outside of Dragonrage.
 *
 * The second part is a graph that shows individual Disintegrate casts aswell as the ticks.
 * This part produces a detailed overview over their entire cast history of Disintegrate.
 * Along with points pointing out good and bad casts, along with explanations.
 *
 * Currently in 10.1.7 it is optimal to clip after third tick of Disintegrate inside of Dragonrage.
 * This counts both for chaining and and clipping casts.
 * It is however, currently, not a strong enough benefit to bonk people for not doing it.
 */

class Disintegrate extends Analyzer {
  /** Variables used for Clipping/Chaining effeciency */
  totalCasts: number = 0;
  totalTicks: number = 0;
  dragonRageTicks: number = 0;
  dragonRageCasts: number = 0;
  inDragonRageWindow: boolean = false;

  /** Variables used for graph */
  currentRemainingTicks: number = 0;
  isCurrentCastChained: boolean = false;
  disintegrateClipSpell: CastEvent | undefined = undefined;
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

  disintegrateTicksCounter: SpellTracker[] = [];
  disintegrateCasts: SpellTracker[] = [];
  disintegrateChainCasts: SpellTracker[] = [];
  disintegrateClips: SpellTracker[] = [];
  problemPoints: SpellTracker[] = [];
  dragonrageBuffCounter: SpellTracker[] = [];

  constructor(options: Options) {
    super(options);

    this.dragonrageBuffCounter.push({
      timestamp: this.owner.fight.start_time,
      count: 0,
      tooltip: '',
    });
    this.disintegrateTicksCounter.push({
      timestamp: this.owner.fight.start_time,
      count: 0,
      tooltip: '',
    });

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT),
      (event) => {
        this.onBuffApply(event);
      },
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT),
      (event) => {
        this.onBuffRemove(event);
      },
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DISINTEGRATE), (event) => {
      this.onDamage(event);
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(DISINTEGRATE), this.onCast);

    /**
     * We use debuff events for Disintegrate for consistentcy
     * Since the only way to know when a disintegrate ended is on removed debuff
     * and the first damage tick happens on application not cast.
     */
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(DISINTEGRATE), (event) => {
      this.onApplyDebuff(event);
    });
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(DISINTEGRATE), (event) => {
      this.onRefreshDebuff(event);
    });
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(DISINTEGRATE), (event) => {
      this.onRemoveDebuff(event);
    });
    /** Grab the spell we clipped with - this event always happens before the debuffRemove event
     * (Atleast for all the logs I've looked at so far) */
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.trackedSpells), (event) => {
      if (this.currentRemainingTicks > 0) {
        this.disintegrateClipSpell = event;
      }
    });
  }

  onBuffApply(event: ApplyBuffEvent) {
    this.dragonrageBuffCounter.push({
      timestamp: event.timestamp,
      count: 5,
      tooltip: '',
    });
    this.inDragonRageWindow = true;
  }

  onBuffRemove(event: RemoveBuffEvent) {
    this.dragonrageBuffCounter.push({
      timestamp: event.timestamp,
      count: 0,
      tooltip: '',
    });
    this.inDragonRageWindow = false;
  }

  onDamage(event: DamageEvent) {
    this.totalTicks += 1;
    if (this.inDragonRageWindow) {
      this.dragonRageTicks += 1;
    }

    // This shouldnt happen but w/e
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

  onCast() {
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

    return {
      regularTicks,
      totalPossibleRegularTicks,
      regularTickRatio: regularTicks / totalPossibleRegularTicks,
      dragonRageTicks,
      totalPossibleDragonRageTicks,
      dragonRageTickRatio: dragonRageTicks / totalPossibleDragonRageTicks,
    };
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    // This is actually a refresh event
    if (HasRelatedEvent(event, DISINTEGRATE_REMOVE_APPLY)) {
      this.onRefreshDebuff(event);
      return;
    }
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
    // Clipped before GCD, very bad
    if (this.currentRemainingTicks > (this.isCurrentCastChained ? 3 : 2)) {
      this.problemPoints.push({
        timestamp: event.timestamp,
        count: this.currentRemainingTicks,
        tooltip: 'Bad Chain, you chained before the 3rd tick.',
      });
    } // Clipped ticks outside of DR, bad
    else if (!this.inDragonRageWindow && this.currentRemainingTicks > 1) {
      this.problemPoints.push({
        timestamp: event.timestamp,
        count: this.currentRemainingTicks,
        tooltip:
          'Bad Chain, you clipped: ' +
          (this.currentRemainingTicks - 1) +
          ' tick(s) outside of Dragonrage',
      });
    } else {
      this.disintegrateChainCasts.push({
        timestamp: event.timestamp,
        count: this.currentRemainingTicks,
        tooltip:
          this.currentRemainingTicks === 2
            ? 'Good Chain, you clipped: ' +
              (this.currentRemainingTicks - 1) +
              ' tick inside of Dragonrage'
            : 'Good Chain',
      });
    }

    this.isCurrentCastChained = true;
    /** Chained Disintegrate moves over one tick from current cast (Pandemic) */
    this.currentRemainingTicks = TICKS_PER_DISINTEGRATE + Math.min(this.currentRemainingTicks, 1);

    this.disintegrateTicksCounter.push({
      timestamp: event.timestamp,
      count: this.currentRemainingTicks,
      tooltip: '',
    });
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    // This is a fake removal ignore it
    if (HasRelatedEvent(event, DISINTEGRATE_REMOVE_APPLY)) {
      return;
    }
    /**
     * Here we wanna check if we clipped the Disintegrate to cast a higher
     * prio spell, this is currently optimal gameplay during Dragonrage
     */
    if (this.disintegrateClipSpell && this.inDragonRageWindow) {
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
    else if (this.currentRemainingTicks > 1) {
      if (this.disintegrateClipSpell) {
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
      else {
        this.problemPoints.push({
          timestamp: event.timestamp,
          count: this.currentRemainingTicks,
          tooltip: 'Cancelled channel, losing: ' + this.currentRemainingTicks + ' tick(s)',
        });
      }
    }

    this.currentRemainingTicks = 0;
    this.disintegrateClipSpell = undefined;

    this.disintegrateTicksCounter.push({
      timestamp: event.timestamp,
      count: this.currentRemainingTicks,
      tooltip: '',
    });
  }

  /** Evaluate individual disintegrate casts */
  guideSubSection(): JSX.Element | null {
    /**
     * Don't show graph in m+
     * Don't show graph if the player didn't cast Disintegrate
     */
    if (
      !this.active ||
      this.owner.report.zone === 34 ||
      this.disintegrateTicksCounter.length === 0
    ) {
      return null;
    }
    return (
      <SubSection title="Disintegrate">
        <p>
          Use the graph below to deepdive into your <SpellLink spell={DISINTEGRATE} /> casts.
          <ul>
            <li>
              Casts are highlighted in <span style={{ color: '#2ecc71' }}>green</span>
            </li>
            <li>
              Chained casts are highligted in <span style={{ color: 'orange' }}>orange</span>
            </li>
            <li>
              Clipped casts are highligted in <span style={{ color: '#9b59b6' }}>purple</span>
            </li>
            <li>
              Problem points are highligted in <span style={{ color: 'red' }}>red</span>
            </li>
            <li>
              <SpellLink spell={DRAGONRAGE_TALENT} /> is shown as a filled in background.
            </li>
          </ul>
          Mouseover each point for more detailed explanations.
        </p>
        <DisintegratePlot
          fightStartTime={this.owner.fight.start_time}
          fightEndTime={this.owner.fight.end_time}
          spellTrackers={[
            this.disintegrateTicksCounter,
            this.disintegrateCasts,
            this.disintegrateChainCasts,
            this.problemPoints,
            this.dragonrageBuffCounter,
            this.disintegrateClips,
          ]}
        />
      </SubSection>
    );
  }
}

export default Disintegrate;
