import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  BeginCastEvent,
  BeginChannelEvent,
  CastEvent,
  DamageEvent,
  EndChannelEvent,
  EventType,
  FightEndEvent,
  GetRelatedEvent,
  GlobalCooldownEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  SummonEvent,
} from 'parser/core/Events';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import SpellLink from 'interface/SpellLink';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts from 'interface/report/Results/Timeline/Casts';
import { formatNumber, formatPercentage } from 'common/format';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { UptimeIcon } from 'interface/icons';
import { EVENT_LINKS } from '../../../constants';
import NPCS from 'common/NPCS/shaman';

type Timeline = {
  start: number;
  end: number;
  events: AnyEvent[];
  performance: QualitativePerformance;
};

interface CallAncestor extends CooldownTrigger<CastEvent | SummonEvent> {
  timeline: Timeline;
  /** Ancestor instance IDs for this window */
  ancestors: Set<number>;
  /** Number of currently active ancestors in this window*/
  activeAncestors: number;
  /** AlwaysBeCasting active time */
  activeTime: number;
}

const SUMMON_ANCESTOR_SPELLS = [
  TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
  SPELLS.ANCESTRAL_SWIFTNESS_CAST.id,
];

const RELATED_WINDOW_BUFFER = 2000;

class CallOfTheAncestors extends MajorCooldown<CallAncestor> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    alwaysBeCasting: AlwaysBeCasting,
  };

  protected alwaysBeCasting!: AlwaysBeCasting;

  windows: CallAncestor[] = [];
  activeWindows: CallAncestor[] = [];
  ancestorSpells = new Map<number, DamageEvent[]>();
  ancestorSourceId: number = 0;

  constructor(options: Options) {
    super({ spell: TALENTS.CALL_OF_THE_ANCESTORS_TALENT }, options);
    if (!this.active) {
      return;
    }

    // find the source id for ancestors in this log
    this.ancestorSourceId =
      this.owner.playerPets.find((pet) => pet.guid === NPCS.FARSEER_ANCESTOR.id)?.id ?? 0;

    // events relevant to the timeline
    [
      Events.begincast,
      Events.cast,
      Events.GlobalCooldown,
      Events.BeginChannel,
      Events.EndChannel,
    ].forEach((filter) => this.addEventListener(filter.by(SELECTED_PLAYER), this.onCast));

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.CALL_OF_THE_ANCESTORS_SUMMON),
      this.summonAncestor,
    );

    [Events.removebuff, Events.removebuffstack].forEach((filter) =>
      this.addEventListener(
        filter.by(SELECTED_PLAYER).spell(SPELLS.CALL_OF_THE_ANCESTORS_BUFF),
        this.onAncestorEnd,
      ),
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onAncestorDamage);

    /** the events from the ancestors can occur well after (i.e. seconds) the "window"
     * ends, so we can't record it immediately. easiest to just delay until the end of the fight */
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onFightEnd(event: FightEndEvent) {
    // end any active windows
    this.activeWindows.forEach((window) => {
      window.timeline.end = event.timestamp;
      this.windows.push(window);
    });

    // record each window
    this.windows.forEach((window) => this.recordCooldown(window));
  }

  onAncestorEnd(event: RemoveBuffStackEvent | RemoveBuffEvent) {
    if (this.activeWindows.length > 0) {
      // decrement the ancestor count from the oldest active window
      const window = this.activeWindows[0];
      window.activeAncestors -= 1;
      // if no ancestors left, end the window
      if (window.activeAncestors === 0) {
        window.timeline.end = event.timestamp;
        this.activeWindows.splice(0, 1);
        this.windows.push(window);
      }
    }
  }

  recordCooldown(cast: CallAncestor) {
    cast.activeTime = this.alwaysBeCasting.getActiveTimePercentageInWindow(
      cast.event.timestamp,
      cast.timeline.end,
    );
    super.recordCooldown(cast);
  }

  /**
   * Start a new ancestor window, or returns the existing window
   * @param event event that triggered the new window
   * @returns the currently active window
   */
  createAncestorWindow(event: CastEvent | SummonEvent): CallAncestor[] {
    const relatedWindows = this.activeWindows.filter(
      (window) => event.timestamp - window.event.timestamp < RELATED_WINDOW_BUFFER,
    );
    if (relatedWindows.length > 0) {
      if (
        event.type === EventType.Summon &&
        !GetRelatedEvent(event, EVENT_LINKS.CallOfTheAncestors)
      ) {
        relatedWindows.forEach((window) => (window.activeAncestors += 1));
      }
      return relatedWindows;
    }
    const window: CallAncestor = {
      event: event,
      ancestors: new Set<number>(),
      activeAncestors: 1,
      activeTime: 0,
      timeline: {
        start: event.timestamp,
        end: -1,
        events: [],
        performance: QualitativePerformance.Perfect,
      },
    };
    this.activeWindows.push(window);
    return [window];
  }

  onCast(
    event: BeginCastEvent | CastEvent | GlobalCooldownEvent | BeginChannelEvent | EndChannelEvent,
  ) {
    if (SUMMON_ANCESTOR_SPELLS.includes(event.ability.guid)) {
      if (event.type === EventType.BeginCast && event.castEvent) {
        this.createAncestorWindow(event.castEvent);
      } else if (event.type === EventType.GlobalCooldown && event.trigger.type === EventType.Cast) {
        this.createAncestorWindow(event.trigger);
      } else if (event.type === EventType.Cast) {
        this.createAncestorWindow(event);
      }
    }

    this.activeWindows.forEach((window) => window.timeline.events.push(event));
  }

  summonAncestor(event: SummonEvent) {
    this.ancestorSpells.set(event.targetInstance, []);
    const windows = this.createAncestorWindow(event);
    windows.forEach((window) => {
      const sourceID = event.targetInstance;
      if (!window.ancestors.has(sourceID)) {
        window.ancestors.add(sourceID);
      }
    });
  }

  onAncestorDamage(event: DamageEvent) {
    if (event.sourceID === this.ancestorSourceId && event.sourceInstance) {
      // record this ancestor's spell
      let events = this.ancestorSpells.get(event.sourceInstance);
      if (!events) {
        events = [];
        this.ancestorSpells.set(event.sourceInstance, events);
      }
      events.push(event);
    }
  }

  description() {
    return (
      <>
        <p>
          While active, <SpellLink spell={TALENTS.CALL_OF_THE_ANCESTORS_TALENT} /> will cast a{' '}
          <SpellLink spell={SPELLS.CALL_OF_THE_ANCESTORS_LAVA_BURST} /> for every single target
          spell, or <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> AoE spell you cast (e.g.{' '}
          <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> or{' '}
          <SpellLink spell={TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT} />)
        </p>
        <p>
          When an ancestor expires, they cast a{' '}
          <SpellLink spell={SPELLS.CALL_OF_THE_ANCESTORS_ELEMENTAL_BLAST} />.
        </p>
        <p>
          To get the most out of each ancestor, you want to maximise the number of high-value
          spells. Focus on your regular rotation, while minimising the number of non-damaging
          spells, and using instant cast spells during forced movement, such as{' '}
          <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> with{' '}
          <SpellLink spell={SPELLS.LAVA_SURGE} />, <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} />,
          or even refreshing <SpellLink spell={SPELLS.FLAME_SHOCK} />
        </p>
      </>
    );
  }

  guideSubsection(): JSX.Element {
    return <CooldownUsage analyzer={this} title="Farseer" />;
  }

  explainPerformance(cast: CallAncestor): SpellUse {
    const { timeline, timelineChecklist } = this.explainTimelineWithDetails(cast);

    const checklistItems = [
      this.explainInvocationMethod(cast),
      this.explainAlwaysBeCasting(cast),
      this.explainAncestors(cast),
      timelineChecklist,
    ];

    return {
      event: cast.event,
      checklistItems: checklistItems,
      extraDetails: timeline,
      performance: getLowestPerf(checklistItems.map((item) => item.performance)),
    };
  }

  private explainInvocationMethod(cast: CallAncestor): ChecklistUsageInfo {
    const source =
      cast.event.type === EventType.Summon ? (
        <>
          <SpellLink spell={TALENTS.ANCIENT_FELLOWSHIP_TALENT} />
        </>
      ) : (
        <>
          <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT} /> or{' '}
          <SpellLink spell={TALENTS.ANCESTRAL_SWIFTNESS_TALENT} />
        </>
      );

    return {
      check: 'invocation',
      details: <div>Source: {source}</div>,
      summary: source,
      performance: QualitativePerformance.Perfect,
      timestamp: cast.event.timestamp,
    };
  }

  private explainAlwaysBeCasting(cast: CallAncestor): ChecklistUsageInfo {
    return {
      check: 'always-be-casting',
      timestamp: cast.event.timestamp,
      summary: <>{formatPercentage(cast.activeTime)}% active time</>,
      details: (
        <>
          <p>
            <strong>
              <UptimeIcon /> {formatPercentage(cast.activeTime)}%
            </strong>{' '}
            active time
          </p>
        </>
      ),
      performance:
        cast.activeTime > 0.95
          ? QualitativePerformance.Perfect
          : cast.activeTime > 0.85
            ? QualitativePerformance.Good
            : cast.activeTime > 0.75
              ? QualitativePerformance.Ok
              : QualitativePerformance.Fail,
    };
  }

  private explainAncestors(cast: CallAncestor): ChecklistUsageInfo {
    // aggregate each ancestor's damage for each spell they cast
    const ancestorSpells = [...cast.ancestors].reduce<Map<number, Map<number, number>>>(
      (acc, ancestor) => {
        // each damage event from the current ancestor
        const damageEvents = this.ancestorSpells.get(ancestor) ?? [];
        // group damage by spell id
        const damageBySpell = damageEvents.reduce<Map<number, number>>((dmgAcc, event) => {
          dmgAcc.set(
            event.ability.guid,
            (dmgAcc.get(event.ability.guid) ?? 0) + event.amount + (event.absorbed || 0),
          );
          return dmgAcc;
        }, new Map<number, number>());
        // add to result
        acc.set(ancestor, damageBySpell);
        return acc;
      },
      new Map<number, Map<number, number>>(),
    );

    // total damage dealt by ancestors in this window
    const totalDamage = [...ancestorSpells].reduce((total, [_, amounts]) => {
      total += [...amounts.values()].reduce((acc, value) => (acc += value), 0);
      return total;
    }, 0);

    return {
      check: 'ancestor-spells',
      details: (
        <>
          <ul>
            {[...ancestorSpells].map(([id, spells], index) => {
              return (
                <div key={`ancestor-${id}`}>
                  <li>
                    <span>Ancestor {index + 1}</span>
                    <ul>
                      {[...spells.entries()].map(([spellId, damage]) => {
                        return (
                          <li key={`ancestor-${id}-${spellId}`}>
                            <SpellLink spell={spellId} />: {formatNumber(damage)}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                </div>
              );
            })}
          </ul>
        </>
      ),
      summary: <>Total ancestor damage: {formatNumber(totalDamage)}</>,
      performance: QualitativePerformance.Perfect,
      timestamp: cast.event.timestamp,
    };
  }

  private explainTimelineWithDetails(cast: CallAncestor) {
    const timelineChecklist = {
      performance: QualitativePerformance.Perfect,
      summary: null,
      details: <span>Spell order: See below</span>,
      check: 'farseer-timeline',
      timestamp: cast.event.timestamp,
    };

    const timeline = (
      <div
        style={{
          overflowX: 'scroll',
        }}
      >
        <EmbeddedTimelineContainer
          secondWidth={60}
          secondsShown={(cast.timeline.end! - cast.timeline.start) / 1000}
        >
          <SpellTimeline>
            <Casts
              start={cast.timeline.start}
              movement={undefined}
              secondWidth={60}
              events={cast.timeline.events}
            />
          </SpellTimeline>
        </EmbeddedTimelineContainer>
      </div>
    );

    return { timeline, timelineChecklist };
  }
}

export default CallOfTheAncestors;
