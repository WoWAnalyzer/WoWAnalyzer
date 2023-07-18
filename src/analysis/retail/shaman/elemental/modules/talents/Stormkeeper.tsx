import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { ELECTRIFIED_SHOCKS_DURATION, ON_CAST_BUFF_REMOVAL_GRACE_MS } from '../../constants';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import MajorCooldown, { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import { QualitativePerformance, getLowestPerf } from 'parser/ui/QualitativePerformance';
import { MaelstromTracker } from 'analysis/retail/shaman/shared';
import Enemies from 'parser/shared/modules/Enemies';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { FLAMESHOCK_BASE_DURATION } from 'analysis/retail/shaman/shared/core/FlameShock';
import { PANDEMIC_WINDOW } from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';
import { Talent } from 'common/TALENTS/types';
import Abilities from '../Abilities';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts from 'interface/report/Results/Timeline/Casts';
import { SpellUse } from 'parser/core/SpellUsage/core';
import { ResourceLink, SpellIcon, SpellLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatDuration } from 'common/format';
import { PerformanceMark } from 'interface/guide';
import SpellMaelstromCost from '../core/SpellMaelstromCost';

const SK_DAMAGE_AFFECTED_ABILITIES = [
  SPELLS.LIGHTNING_BOLT_OVERLOAD,
  SPELLS.LIGHTNING_BOLT,
  SPELLS.CHAIN_LIGHTNING_OVERLOAD,
  TALENTS.CHAIN_LIGHTNING_TALENT,
];

interface SKTimeline {
  /** The start time (in ms) of the window */
  start: number;
  /** The end time (in ms) of the window */
  end: number;
  /** The events that happened inside the window */
  events: CastEvent[];
  /** The performance of the window */
  performance: QualitativePerformance;
}

interface SKCast extends SpellCast {
  /** How much maelstrom the user had when starting the window rotation */
  maelstromOnCast: number;
  /** How long Flameshock had left when starting the window rotation */
  flameshockDurationOnCast: number;
  /** How long Electrified shocks had left when starting the window rotation */
  electrifiedShocksDurationOnCast: number;
  /** If the user had Surge of Power already active when casting SK */
  sopOnCast: boolean;
  /** If the user had Master of the Elements already active when casting SK */
  moteOnCast: boolean;
  /** What the user cast between casting SK and consuming the second buff. */
  timeline: SKTimeline;
  /** The ability that started the window. */
  firstRotationCast: CastEvent;
}

// Spells that are considered to start the damage part of the SK window.
const WINDOW_START_SPELLS = [
  SPELLS.LIGHTNING_BOLT.id,
  TALENTS.CHAIN_LIGHTNING_TALENT.id,
  TALENTS.LAVA_BURST_TALENT.id,
  TALENTS.EARTH_SHOCK_TALENT.id,
  TALENTS.ELEMENTAL_BLAST_TALENT.id,
  TALENTS.EARTHQUAKE_TALENT.id,
];

// Spells that must have SOP if cast within the SK window
const SPELLS_SOP_BUFF_REQUIRED = [SPELLS.LIGHTNING_BOLT.id, TALENTS.CHAIN_LIGHTNING_TALENT.id];
/** The performance to set the timeline to if the user missed SoP on one of
 *  the spells above
 */
const SOP_BUFF_MISSING_PERFORMANCE = QualitativePerformance.Fail;

/** The performance to set the timeline to if the user missed the Mote buff
 *  on EB
 */
const MISSING_MOTE_PERFORMANCE = QualitativePerformance.Ok;

/** How much maelstrom the user should have before starting the SK rotation,
 * presuming they have to cast both spenders.
 *
 * This will be adjusted for depending on if the user has precast one spender
 * before pressing SK
 */
const BASE_MAELSTROM_REQUIRED = 90;
/** Maelstrom required on first WINDOW_START_SPELLS if SK was cast before pull. */
const BASE_MAELSTROM_REQUIRED_PREPULL_CAST = 39; // IF + FrS

/** How much maelstrom the first spell in the SK damage rotation generates,
 * presuming they cast the entire rotation after pressing SK. This value is
 * used to determine if the user overcapped maelstrom on the start of the SK
 * window.
 */
const FIRST_CAST_MAELSTROM_GENERATION = 12; // LvB

class Stormkeeper extends MajorCooldown<SKCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    maelstromTracker: MaelstromTracker,
    enemies: Enemies,
    spellUsable: SpellUsable,
    spellMaelstromCost: SpellMaelstromCost,
  };

  protected maelstromTracker!: MaelstromTracker;
  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;
  protected spellMaelstromCost!: SpellMaelstromCost;

  activeWindow: SKCast | null = null;
  lastSKHardcast: CastEvent | null = null;

  stSpender: Talent;

  damageDoneByBuffedCasts = 0;

  constructor(options: Options) {
    super({ spell: TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT }, options);

    this.stSpender = this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_TALENT)
      ? TALENTS.ELEMENTAL_BLAST_TALENT
      : TALENTS.EARTH_SHOCK_TALENT;
    this.active =
      this.selectedCombatant.getRepeatedTalentCount(TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT) > 0;
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onEventDuringSK);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT),
      this.onSKCast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT),
      this.onSKFalloff,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SK_DAMAGE_AFFECTED_ABILITIES),
      this.onSKDamage,
    );
  }

  onSKCast(cast: CastEvent) {
    this.lastSKHardcast = cast;
  }

  onSKFalloff(event: RemoveBuffEvent) {
    if (!this.activeWindow) {
      return;
    }

    this.activeWindow.timeline.end = event.timestamp;

    this.recordCooldown(this.activeWindow);
    this.lastSKHardcast = null;
    this.activeWindow = null;
  }

  onEventDuringSK(event: CastEvent) {
    /* Don't include events that did not happen between hardcasts and the
    SK buff falling off. */
    if (!this.lastSKHardcast) {
      return;
    }

    if (this.activeWindow) {
      const isPrepull = this.activeWindow.event.timestamp < this.owner.fight.start_time;
      const spenderNotAlreadyCast = !this.activeWindow.timeline.events
        .map((e) => e.ability.guid)
        .includes(this.stSpender.id);

      if (
        event.ability.guid === this.stSpender.id &&
        !this.selectedCombatant.hasBuff(
          SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id,
          event.timestamp,
          ON_CAST_BUFF_REMOVAL_GRACE_MS,
        ) &&
        // Some rotations cast SK before pull. In this case, the rotation is slightly different.
        !(isPrepull && spenderNotAlreadyCast)
      ) {
        event.meta = {
          isInefficientCast: true,
          inefficientCastReason: <>{this.stSpender.name} cast without Master of the Elements</>,
        };
        this.activeWindow.timeline.performance = getLowestPerf([
          MISSING_MOTE_PERFORMANCE,
          this.activeWindow.timeline.performance,
        ]);
      }

      const sopSpellNotAlreadyCast =
        this.activeWindow.timeline.events
          .map((e) => e.ability.guid)
          .filter((e) => SPELLS_SOP_BUFF_REQUIRED.includes(e)).length === 0;

      if (
        SPELLS_SOP_BUFF_REQUIRED.includes(event.ability.guid) &&
        !this.selectedCombatant.hasBuff(
          SPELLS.SURGE_OF_POWER_BUFF.id,
          event.timestamp,
          ON_CAST_BUFF_REMOVAL_GRACE_MS,
        ) &&
        // Some rotations cast SK before pull. In this case, the rotation is slightly different.
        !(isPrepull && sopSpellNotAlreadyCast)
      ) {
        event.meta = {
          isInefficientCast: true,
          inefficientCastReason: <>{event.ability.name} cast without Surge of Power</>,
        };
        this.activeWindow.timeline.performance = getLowestPerf([
          SOP_BUFF_MISSING_PERFORMANCE,
          this.activeWindow.timeline.performance,
        ]);
      }

      this.activeWindow.timeline.events.push(event);
    } else if (WINDOW_START_SPELLS.includes(event.ability.guid)) {
      // Create the window if it doesn't exist.

      const eventResourceCost = event.resourceCost
        ? event.resourceCost[RESOURCE_TYPES.MAELSTROM.id]
        : 0;

      this.activeWindow = {
        event: this.lastSKHardcast,
        // The resourceTracker has already accounted for the resource cost of
        // this cast. If it did cost maelstrom, we want to un-do that in the SK window calculation.
        maelstromOnCast: this.maelstromTracker.current + eventResourceCost,
        flameshockDurationOnCast:
          this.enemies
            .getEntity(event)
            ?.getRemainingBuffTimeAtTimestamp(
              SPELLS.FLAME_SHOCK.id,
              FLAMESHOCK_BASE_DURATION,
              FLAMESHOCK_BASE_DURATION * (1 + PANDEMIC_WINDOW),
              event.timestamp,
            ) || 0,
        electrifiedShocksDurationOnCast:
          this.enemies
            .getEntity(event)
            ?.getRemainingBuffTimeAtTimestamp(
              SPELLS.ELECTRIFIED_SHOCKS_DEBUFF.id,
              ELECTRIFIED_SHOCKS_DURATION,
              ELECTRIFIED_SHOCKS_DURATION,
              event.timestamp,
            ) || 0,
        sopOnCast: this.selectedCombatant.hasBuff(SPELLS.SURGE_OF_POWER_BUFF.id),
        moteOnCast: this.selectedCombatant.hasBuff(SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id),
        timeline: {
          start: this.lastSKHardcast.timestamp,
          end: -1,
          events: [this.lastSKHardcast],
          performance: QualitativePerformance.Perfect,
        },
        firstRotationCast: event,
      };
    }
  }

  onSKDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(
        TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT.id,
        event.timestamp,
        ON_CAST_BUFF_REMOVAL_GRACE_MS,
      )
    ) {
      return;
    }

    this.damageDoneByBuffedCasts += event.amount + (event.absorbed || 0);
  }

  _explainTimelineWithDetails(cast: SKCast) {
    const checklistItem = {
      performance: cast.timeline.performance,
      summary: <span>Spell order</span>,
      details: <span>Spell order: See below</span>,
      check: 'stormkeeper-timeline',
      timestamp: cast.event.timestamp,
    };

    const showPrecastSop = SPELLS_SOP_BUFF_REQUIRED.includes(cast.firstRotationCast.ability.guid);
    const showPrecastMote = [this.stSpender.id].includes(cast.firstRotationCast.ability.guid);

    const showPrecastAny = showPrecastSop || showPrecastMote;

    const extraDetails = (
      <div
        style={{
          overflowX: 'scroll',
        }}
      >
        {showPrecastAny && (
          <p style={{ marginBottom: '0px' }}>
            <strong>Precast</strong>
          </p>
        )}
        {showPrecastSop && (
          <p>
            <SpellIcon spell={TALENTS.SURGE_OF_POWER_TALENT} />:{' '}
            <PerformanceMark
              perf={
                cast.firstRotationCast.meta?.isEnhancedCast
                  ? QualitativePerformance.Good
                  : QualitativePerformance.Fail
              }
            />
          </p>
        )}

        {showPrecastMote && (
          <p>
            <SpellIcon spell={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT} />:{' '}
            <PerformanceMark
              perf={
                cast.firstRotationCast.meta?.isEnhancedCast
                  ? QualitativePerformance.Good
                  : QualitativePerformance.Fail
              }
            />
          </p>
        )}
        <EmbeddedTimelineContainer
          secondWidth={60}
          secondsShown={(cast.timeline.end - cast.timeline.start) / 1000}
        >
          <SpellTimeline>
            <Casts
              start={cast.event.timestamp}
              movement={undefined}
              secondWidth={60}
              events={cast.timeline.events}
            />
          </SpellTimeline>
        </EmbeddedTimelineContainer>
      </div>
    );

    return { extraDetails, checklistItem };
  }

  /**
   * Determine the performance of how much maelstrom the user had when casting SK
   */
  _determineMaelstromPerformance(maelstromRequired: number, cast: SKCast): QualitativePerformance {
    let maelstromOnCastPerformance = QualitativePerformance.Ok;
    if (
      cast.maelstromOnCast >
      this.maelstromTracker.maxResource - FIRST_CAST_MAELSTROM_GENERATION
    ) {
      maelstromOnCastPerformance = QualitativePerformance.Good;
    } else if (cast.maelstromOnCast >= maelstromRequired) {
      maelstromOnCastPerformance = QualitativePerformance.Perfect;
    }

    return maelstromOnCastPerformance;
  }

  _explainMaelstromPerformance(cast: SKCast) {
    let maelstromRequired;
    if (cast.event.timestamp < this.owner.fight.start_time) {
      maelstromRequired = BASE_MAELSTROM_REQUIRED_PREPULL_CAST;
    } else {
      maelstromRequired = BASE_MAELSTROM_REQUIRED;
    }

    if (cast.sopOnCast) {
      maelstromRequired -= this.spellMaelstromCost.findAdjustedSpellResourceCost(
        this.stSpender.id,
        this.stSpender.maelstromCost || 0,
      );
    }

    const maelstromOnCastPerformance = this._determineMaelstromPerformance(maelstromRequired, cast);

    const checklistItem = {
      performance: maelstromOnCastPerformance,
      summary: (
        <span>
          {cast.maelstromOnCast} <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} />
        </span>
      ),
      details: (
        <span>
          {cast.maelstromOnCast} <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> on window start{' '}
          (Should have been {maelstromRequired})
        </span>
      ),
      check: 'stormkeeper-maelstrom',
      timestamp: cast.event.timestamp,
    };

    return checklistItem;
  }

  _determineFlameshockPerformance(flameshockDurationOnCast: number): QualitativePerformance {
    if (flameshockDurationOnCast > 10000) {
      return QualitativePerformance.Perfect;
    } else {
      return QualitativePerformance.Ok;
    }
  }

  _explainFlSPerformance(cast: SKCast) {
    const FlSPerformance = this._determineFlameshockPerformance(cast.flameshockDurationOnCast);

    const checklistItem = {
      performance: FlSPerformance,
      summary: (
        <span>
          <SpellLink spell={SPELLS.FLAME_SHOCK} />: {formatDuration(cast.flameshockDurationOnCast)}s{' '}
        </span>
      ),
      details: (
        <span>
          {' '}
          <SpellLink spell={SPELLS.FLAME_SHOCK} />: {formatDuration(cast.flameshockDurationOnCast)}s
          remaining on window start
        </span>
      ),
      check: 'stormkeeper-flameshock',
      timestamp: cast.event.timestamp,
    };

    return checklistItem;
  }

  _determineElshocksPerformance(elshocksDurationOnCast: number): QualitativePerformance {
    if (elshocksDurationOnCast > 6000) {
      return QualitativePerformance.Perfect;
    } else {
      return QualitativePerformance.Ok;
    }
  }

  _explainElShocksPerformance(cast: SKCast) {
    const ElShocksPerformance = this._determineElshocksPerformance(
      cast.electrifiedShocksDurationOnCast,
    );

    const checklistItem = {
      performance: ElShocksPerformance,
      summary: (
        <span>
          <SpellLink spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} />:{' '}
          {formatDuration(cast.electrifiedShocksDurationOnCast)}s
        </span>
      ),
      details: (
        <span>
          {' '}
          <SpellLink spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} />:{' '}
          {formatDuration(cast.electrifiedShocksDurationOnCast)}s remaining on window start
        </span>
      ),
      check: 'stormkeeper-elshocks',
      timestamp: cast.event.timestamp,
    };

    return checklistItem;
  }

  _determineTotalWindowPerformance(
    timelinePerformance: QualitativePerformance,
    maelstromOnCastPerformance: QualitativePerformance,
    FlSPerformance: QualitativePerformance,
    elshocksPerformance: QualitativePerformance,
  ) {
    return getLowestPerf([
      timelinePerformance,
      maelstromOnCastPerformance,
      /* Failing this should not nuke the entire performance, so make the lower
      limit Good */
      FlSPerformance === QualitativePerformance.Perfect
        ? QualitativePerformance.Perfect
        : QualitativePerformance.Good,
      /* Failing this should not nuke the entire performance, so make the lower
      limit Good */
      elshocksPerformance === QualitativePerformance.Perfect
        ? QualitativePerformance.Perfect
        : QualitativePerformance.Good,
    ]);
  }

  explainPerformance(cast: SKCast): SpellUse {
    const timeline = this._explainTimelineWithDetails(cast);
    const maelstromOnCast = this._explainMaelstromPerformance(cast);
    const FlSDuration = this._explainFlSPerformance(cast);
    const ELShocksperf = this._explainElShocksPerformance(cast);

    const totalPerformance = this._determineTotalWindowPerformance(
      timeline.checklistItem.performance,
      maelstromOnCast.performance,
      FlSDuration.performance,
      ELShocksperf.performance,
    );

    return {
      event: cast.event,
      performance: totalPerformance,
      checklistItems: [timeline.checklistItem, maelstromOnCast, ELShocksperf, FlSDuration],
      extraDetails: timeline.extraDetails,
    };
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} size="flexible">
        <BoringSpellValueText spell={TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT}>
          <>
            <ItemDamageDone amount={this.damageDoneByBuffedCasts} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  description() {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT} />
          </strong>{' '}
          massively amplifies the strength of your next two
          <SpellLink spell={SPELLS.LIGHTNING_BOLT} /> or
          <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> casts. Therefore, you want to combine
          this effect with as many of the other damage amplifying effects you have at your disposal.
        </p>
        <p>
          In short, the ideal cast order is the following: <br />
          <small>For more information, see the written guides.</small>
        </p>
        <p>
          (<SpellIcon spell={SPELLS.FLAME_SHOCK} /> &rarr;) (
          <SpellIcon spell={TALENTS.FROST_SHOCK_TALENT} /> &rarr;)
          <SpellIcon spell={TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT} /> &rarr;
          <SpellIcon spell={TALENTS.LAVA_BURST_TALENT} /> &rarr;
          <SpellIcon spell={TALENTS.ELEMENTAL_BLAST_TALENT} /> &rarr;
          <SpellIcon spell={SPELLS.LIGHTNING_BOLT} /> &rarr;
          <SpellIcon spell={TALENTS.FROST_SHOCK_TALENT} /> &rarr;
          <SpellIcon spell={TALENTS.LAVA_BURST_TALENT} /> &rarr;
          <SpellIcon spell={TALENTS.ELEMENTAL_BLAST_TALENT} /> &rarr;
          <SpellIcon spell={SPELLS.LIGHTNING_BOLT} />
        </p>
        <p>
          <small>
            Note: This section does not include T30 2pc procs, this is only when the spell itself is
            cast.
          </small>
        </p>
      </>
    );
  }

  guideSubsection(): JSX.Element {
    return <CooldownUsage analyzer={this} />;
  }
}

export default Stormkeeper;
