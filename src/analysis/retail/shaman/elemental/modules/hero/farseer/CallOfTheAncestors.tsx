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
  GlobalCooldownEvent,
  RemoveBuffEvent,
  SummonEvent,
} from 'parser/core/Events';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import SpellLink from 'interface/SpellLink';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts from 'interface/report/Results/Timeline/Casts';
import { formatNumber } from 'common/format';
import { TooltipElement } from 'interface/Tooltip';
import { GoodColor, PerfectColor } from 'interface/guide';
import { Highlight } from 'interface/Highlight';

type Timeline = {
  start: number;
  end: number;
  events: AnyEvent[];
  performance: QualitativePerformance;
};

interface CallAncestor extends CooldownTrigger<CastEvent | SummonEvent> {
  timeline: Timeline;
  /** Ancestor instance IDs for this trigger */
  ancestors: Set<number>;
}

const SUMMON_ANCESTOR_SPELLS = [
  TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
  SPELLS.ANCESTRAL_SWIFTNESS_CAST.id,
];

class CallOfTheAncestors extends MajorCooldown<CallAncestor> {
  windows: CallAncestor[] = [];
  activeWindow: CallAncestor | null = null;
  ancestorSpells = new Map<number, DamageEvent[]>();
  ancestorSourceId: number = 0;

  constructor(options: Options) {
    super({ spell: TALENTS.CALL_OF_THE_ANCESTORS_TALENT }, options);
    if (!this.active) {
      return;
    }

    // find the source id for ancestors in this log
    this.ancestorSourceId = this.owner.playerPets.find((pet) => pet.name === 'Ancestor')?.id ?? 0;

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

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CALL_OF_THE_ANCESTORS_BUFF),
      this.onAncestorEnd,
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onAncestorDamage);

    /** the events from the ancestors can occur well after (i.e. seconds) the "window"
     * ends, so we can't record it immediately. easiest to just delay until the end of the fight */
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onFightEnd(event: FightEndEvent) {
    if (this.activeWindow) {
      this.activeWindow.timeline.end = event.timestamp;
    }
    this.windows.forEach((window) => this.recordCooldown(window));
  }

  onAncestorEnd(event: RemoveBuffEvent) {
    if (this.activeWindow) {
      this.activeWindow.timeline.end = event.timestamp;
      this.windows.push(this.activeWindow);
      this.activeWindow = null;
    }
  }

  /**
   * Start a new ancestor window, or returns the existing window
   * @param event event that triggered the new window
   * @param forceNewWindow if a window already exists, end it and start a new one
   * @returns the currently active window
   */
  createAncestorWindow(event: CastEvent | SummonEvent, forceNewWindow: boolean) {
    if (forceNewWindow && this.activeWindow) {
      this.activeWindow.timeline.end = event.timestamp;
      this.windows.push(this.activeWindow);
    }

    if (!this.activeWindow) {
      this.activeWindow = {
        event: event,
        ancestors: new Set<number>(),
        timeline: {
          start: event.timestamp,
          end: -1,
          events: [],
          performance: QualitativePerformance.Perfect,
        },
      };
    }
    return this.activeWindow;
  }

  onCast(
    event: BeginCastEvent | CastEvent | GlobalCooldownEvent | BeginChannelEvent | EndChannelEvent,
  ) {
    if (SUMMON_ANCESTOR_SPELLS.includes(event.ability.guid)) {
      if (!this.activeWindow) {
        if (event.type === EventType.BeginCast && event.castEvent) {
          this.createAncestorWindow(event.castEvent, true);
        } else if (
          event.type === EventType.GlobalCooldown &&
          event.trigger.type === EventType.Cast
        ) {
          this.createAncestorWindow(event.trigger, true);
        } else if (event.type === EventType.Cast) {
          this.createAncestorWindow(event, true);
        }
      }
    }

    if (this.activeWindow) {
      this.activeWindow.timeline.events.push(event);
    }
  }

  summonAncestor(event: SummonEvent) {
    this.ancestorSpells.set(event.targetInstance, []);
    this.createAncestorWindow(event, false);
    this.ensureAncestorExistsInWindow(event.targetInstance);
  }

  ensureAncestorExistsInWindow(sourceID: number) {
    if (this.activeWindow && !this.activeWindow.ancestors.has(sourceID)) {
      this.activeWindow.ancestors.add(sourceID);
    }
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
    return (
      <CooldownUsage
        analyzer={this}
        title="Farseer"
        castBreakdownSmallText={this.castBreakdownSmallText}
      />
    );
  }

  get castBreakdownSmallText() {
    return (
      <>
        - These boxes represent each ancestor window, color coded by the spell that triggered it.
        <TooltipElement
          content={
            <>
              Used for ancestors triggered by <SpellLink spell={TALENTS.HEED_MY_CALL_TALENT} />
            </>
          }
        >
          <Highlight color={GoodColor} textColor="black">
            Green
          </Highlight>
        </TooltipElement>{' '}
        for procs, or{' '}
        <TooltipElement
          content={
            <>
              Used for ancestors triggered by{' '}
              <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT} /> or{' '}
              <SpellLink spell={TALENTS.ANCESTRAL_SWIFTNESS_TALENT} />
            </>
          }
        >
          <Highlight color={PerfectColor} textColor="white">
            blue
          </Highlight>
        </TooltipElement>{' '}
        for manually triggered via spells.
      </>
    );
  }

  explainPerformance(cast: CallAncestor): SpellUse {
    const { timeline, timelineChecklist } = this.explainTimelineWithDetails(cast);
    return {
      event: cast.event,
      checklistItems: [
        this.explainInvocationMethod(cast),
        this.explainAncestors(cast),
        timelineChecklist,
      ],
      extraDetails: timeline,
      performance:
        cast.event.type === EventType.Summon
          ? QualitativePerformance.Good
          : QualitativePerformance.Perfect,
    };
  }

  private explainInvocationMethod(cast: CallAncestor): ChecklistUsageInfo {
    const source =
      cast.event.type === EventType.Summon ? (
        <>
          <SpellLink spell={TALENTS.HEED_MY_CALL_TALENT} />
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
      performance: QualitativePerformance.Good,
      timestamp: cast.event.timestamp,
    };
  }

  private explainAncestors(cast: CallAncestor): ChecklistUsageInfo {
    const ancestorSpells = [...cast.ancestors].reduce<Map<number, Map<number, number>>>(
      (acc, ancestor) => {
        const spells = this.ancestorSpells.get(ancestor) ?? [];
        const damageBySpell = spells.reduce<Map<number, number>>((dmgAcc, event) => {
          dmgAcc.set(
            event.ability.guid,
            (dmgAcc.get(event.ability.guid) ?? 0) + event.amount + (event.absorbed || 0),
          );
          return dmgAcc;
        }, new Map<number, number>());
        acc.set(ancestor, damageBySpell);
        return acc;
      },
      new Map<number, Map<number, number>>(),
    );

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
                <>
                  <div>
                    <li key={`ancestor-${id}`}>
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
                </>
              );
            })}
          </ul>
        </>
      ),
      summary: <>Total ancestor damage: {formatNumber(totalDamage)}</>,
      performance: QualitativePerformance.Good,
      timestamp: cast.event.timestamp,
    };
  }

  private explainTimelineWithDetails(cast: CallAncestor) {
    const timelineChecklist = {
      performance: QualitativePerformance.Good,
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
