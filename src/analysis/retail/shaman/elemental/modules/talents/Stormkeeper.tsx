import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  BeginCastEvent,
  BeginChannelEvent,
  CastEvent,
  DamageEvent,
  EndChannelEvent,
  EventType,
  GlobalCooldownEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { ON_CAST_BUFF_REMOVAL_GRACE_MS, ENABLE_MOTE_CHECKS } from '../../constants';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import { QualitativePerformance, getLowestPerf } from 'parser/ui/QualitativePerformance';
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
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { ResourceLink, SpellIcon, SpellLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatDuration } from 'common/format';
import { PerformanceMark } from 'interface/guide';
import SpellMaelstromCost from '../core/SpellMaelstromCost';
import MaelstromTracker from '../resources/MaelstromTracker';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

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
  events: AnyEvent[];
  /** The performance of the window */
  performance: QualitativePerformance;
}

interface StormkeeperCast extends CooldownTrigger<BeginCastEvent | ApplyBuffEvent> {
  /** How much maelstrom the user had when starting the window rotation */
  maelstromOnCast: number;
  /** How long Flameshock had left when starting the window rotation */
  flameshockDurationOnCast: number;
  /** If the user had Surge of Power already active when casting SK */
  sopOnCast: boolean;
  /** If the user had Master of the Elements already active when casting SK */
  moteOnCast: boolean;
  /** What the user cast between casting SK and consuming the second buff. */
  timeline: SKTimeline;
  /** The ability that started the window. */
  firstRotationCast?: CastEvent;
}

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

const FLAMESHOCK_IDEAL_DURATION_REMAINING = 10000;
const ELECTRIFIED_SHOCKS_IDEAL_DURATION_REMAINING = 6000;

class Stormkeeper extends MajorCooldown<StormkeeperCast> {
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

  nextCastStartsWindow: boolean = false;
  stormkeeperCast: BeginCastEvent | null = null;

  activeWindow: StormkeeperCast | null = null;
  stSpender: Talent;
  damageDoneByBuffedCasts = 0;

  constructor(options: Options) {
    super({ spell: TALENTS.STORMKEEPER_TALENT }, options);

    this.stSpender = this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT)
      ? TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT
      : TALENTS.EARTH_SHOCK_TALENT;
    this.active = this.selectedCombatant.hasTalent(TALENTS.STORMKEEPER_TALENT);
    if (!this.active) {
      return;
    }

    [Events.begincast, Events.applybuff].forEach((filter) =>
      this.addEventListener(
        filter.by(SELECTED_PLAYER).spell(SPELLS.STORMKEEPER_BUFF_AND_CAST),
        this.onStormkeeperWindowStart,
      ),
    );

    [
      Events.begincast,
      Events.BeginChannel,
      Events.EndChannel,
      Events.cast,
      Events.GlobalCooldown,
    ].forEach((filter) =>
      this.addEventListener(filter.by(SELECTED_PLAYER), this.addEventToTimeline),
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STORMKEEPER_BUFF_AND_CAST),
      () => (this.nextCastStartsWindow = true),
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.STORMKEEPER_BUFF_AND_CAST),
      this.onStormkeeperRemoved,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SK_DAMAGE_AFFECTED_ABILITIES),
      this.onDamage,
    );
  }

  onStormkeeperWindowStart(event: BeginCastEvent | ApplyBuffEvent) {
    // cast was successful and not already in a stormkeeper window
    if ((event.type === EventType.ApplyBuff || event.castEvent) && !this.activeWindow) {
      this.activeWindow = {
        event: event,
        maelstromOnCast: this.maelstromTracker.current,
        flameshockDurationOnCast:
          this.enemies
            .getEntity(event)
            ?.getRemainingBuffTimeAtTimestamp(
              SPELLS.FLAME_SHOCK.id,
              FLAMESHOCK_BASE_DURATION,
              FLAMESHOCK_BASE_DURATION * (1 + PANDEMIC_WINDOW),
              event.timestamp,
            ) || 0,
        sopOnCast: this.selectedCombatant.hasBuff(SPELLS.SURGE_OF_POWER_BUFF.id),
        moteOnCast: this.selectedCombatant.hasBuff(SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id),
        timeline: {
          start: event.timestamp,
          end: -1,
          events: [],
          performance: QualitativePerformance.Perfect,
        },
      };
    }
  }

  onStormkeeperRemoved(event: RemoveBuffEvent) {
    if (!this.activeWindow) {
      return;
    }

    const lastGcd = this.activeWindow.timeline.events
      .filter((e) => e.type === EventType.GlobalCooldown)
      .at(-1);
    this.activeWindow.timeline.end = Math.max(
      event.timestamp,
      lastGcd?.type === EventType.GlobalCooldown ? lastGcd.timestamp + lastGcd.duration : 0,
    );
    this.recordCooldown(this.activeWindow);
    this.nextCastStartsWindow = false;
    this.activeWindow = null;
  }

  addEventToTimeline(
    event: BeginCastEvent | BeginChannelEvent | EndChannelEvent | CastEvent | GlobalCooldownEvent,
  ) {
    if (this.activeWindow) {
      const isPrepull = this.activeWindow.event.timestamp < this.owner.fight.start_time;
      const spenderNotAlreadyCast = !this.activeWindow.timeline.events
        .filter((e) => e.type === EventType.Cast)
        .map((e) => (e.type === EventType.Cast ? e.ability.guid : -1))
        .includes(this.stSpender.id);

      if (event.type === EventType.Cast) {
        this.activeWindow.firstRotationCast ??= event;

        if (
          ENABLE_MOTE_CHECKS &&
          event.ability.guid === this.stSpender.id &&
          !this.selectedCombatant.hasBuff(
            SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id,
            event.timestamp,
            ON_CAST_BUFF_REMOVAL_GRACE_MS,
          ) &&
          // Some rotations cast SK before pull. In this case, the rotation is slightly different.
          !(isPrepull && spenderNotAlreadyCast)
        ) {
          addInefficientCastReason(
            event,
            <>{this.stSpender.name} cast without Master of the Elements</>,
          );
          this.activeWindow.timeline.performance = getLowestPerf([
            MISSING_MOTE_PERFORMANCE,
            this.activeWindow.timeline.performance,
          ]);
        }

        const sopSpellNotAlreadyCast =
          this.activeWindow.timeline.events
            .filter((e) => e.type === EventType.Cast)
            .map((e) => (e.type === EventType.Cast ? e.ability.guid : -1))
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
          addInefficientCastReason(event, <>{event.ability.name} cast without Surge of Power</>);
          this.activeWindow.timeline.performance = getLowestPerf([
            SOP_BUFF_MISSING_PERFORMANCE,
            this.activeWindow.timeline.performance,
          ]);
        }
      }

      this.activeWindow.timeline.events.push(event);
    }
  }

  onDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(
        SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        event.timestamp,
        ON_CAST_BUFF_REMOVAL_GRACE_MS,
      )
    ) {
      return;
    }

    this.damageDoneByBuffedCasts += event.amount + (event.absorbed || 0);
  }

  private explainTimelineWithDetails(cast: StormkeeperCast) {
    const checklistItem = {
      performance: cast.timeline.performance,
      summary: <span>Spell order</span>,
      details: <span>Spell order: See below</span>,
      check: 'stormkeeper-timeline',
      timestamp: cast.event.timestamp,
    };

    const showPrecastSop =
      cast.firstRotationCast &&
      SPELLS_SOP_BUFF_REQUIRED.includes(cast.firstRotationCast.ability.guid);
    // lava burst and therefore master of the elements are not currently relevant to stormkeeper windows
    const showPrecastMote =
      ENABLE_MOTE_CHECKS && [this.stSpender.id].includes(cast.firstRotationCast!.ability.guid);

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
                cast.firstRotationCast!.meta?.isEnhancedCast
                  ? QualitativePerformance.Good
                  : QualitativePerformance.Fail
              }
            />
          </p>
        )}

        {showPrecastMote && (
          <p>
            <SpellIcon spell={TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT} />:{' '}
            <PerformanceMark
              perf={
                cast.firstRotationCast!.meta?.isEnhancedCast
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
  private determineMaelstromPerformance(
    maelstromRequired: number,
    cast: StormkeeperCast,
  ): QualitativePerformance {
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

  private explainMaelstromPerformance(cast: StormkeeperCast) {
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

    const maelstromOnCastPerformance = this.determineMaelstromPerformance(maelstromRequired, cast);

    const checklistItem = {
      performance: maelstromOnCastPerformance,
      summary: (
        <span>
          {cast.maelstromOnCast} <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} />
        </span>
      ),
      details: (
        <span>
          Had at least {maelstromRequired} <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> on
          window start (you had {cast.maelstromOnCast})
        </span>
      ),
      check: 'stormkeeper-maelstrom',
      timestamp: cast.event.timestamp,
    };

    return checklistItem;
  }

  private determineFlameshockPerformance(flameshockDurationOnCast: number): QualitativePerformance {
    if (flameshockDurationOnCast > FLAMESHOCK_IDEAL_DURATION_REMAINING) {
      return QualitativePerformance.Perfect;
    } else {
      return QualitativePerformance.Ok;
    }
  }

  private explainFlSPerformance(cast: StormkeeperCast) {
    const FlSPerformance = this.determineFlameshockPerformance(cast.flameshockDurationOnCast);

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
          <SpellLink spell={SPELLS.FLAME_SHOCK} /> had at least{' '}
          {formatDuration(FLAMESHOCK_IDEAL_DURATION_REMAINING)} seconds remaining on window start
          (you had {formatDuration(cast.flameshockDurationOnCast)}s)
        </span>
      ),
      check: 'stormkeeper-flameshock',
      timestamp: cast.event.timestamp,
    };

    return checklistItem;
  }

  private determineElshocksPerformance(elshocksDurationOnCast: number): QualitativePerformance {
    if (elshocksDurationOnCast > ELECTRIFIED_SHOCKS_IDEAL_DURATION_REMAINING) {
      return QualitativePerformance.Perfect;
    } else {
      return QualitativePerformance.Ok;
    }
  }

  private determineTotalWindowPerformance(
    timelinePerformance: QualitativePerformance,
    maelstromOnCastPerformance: QualitativePerformance,
    FlSPerformance: QualitativePerformance,
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
    ]);
  }

  explainPerformance(cast: StormkeeperCast): SpellUse {
    const timeline = this.explainTimelineWithDetails(cast);
    const maelstromOnCast = this.explainMaelstromPerformance(cast);
    const FlSDuration = this.explainFlSPerformance(cast);

    const totalPerformance = this.determineTotalWindowPerformance(
      timeline.checklistItem.performance,
      maelstromOnCast.performance,
      ENABLE_MOTE_CHECKS ? FlSDuration.performance : QualitativePerformance.Perfect,
    );

    return {
      event: cast.event,
      performance: totalPerformance,
      checklistItems: [
        timeline.checklistItem,
        maelstromOnCast,
        ENABLE_MOTE_CHECKS ? FlSDuration : null,
      ].filter((x) => x) as ChecklistUsageInfo[],
      extraDetails: timeline.extraDetails,
    };
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} size="flexible">
        <BoringSpellValueText spell={TALENTS.STORMKEEPER_TALENT}>
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
            <SpellLink spell={TALENTS.STORMKEEPER_TALENT} />
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
          <SpellIcon spell={TALENTS.STORMKEEPER_TALENT} /> &rarr;
          <SpellIcon spell={this.stSpender} /> &rarr;
          <SpellIcon spell={SPELLS.LIGHTNING_BOLT} /> &rarr;
          <SpellIcon spell={this.stSpender} /> &rarr;
          <SpellIcon spell={SPELLS.LIGHTNING_BOLT} />
        </p>
      </>
    );
  }

  guideSubsection(): JSX.Element {
    return <CooldownUsage analyzer={this} title="Stormkeeper" />;
  }
}

export default Stormkeeper;
