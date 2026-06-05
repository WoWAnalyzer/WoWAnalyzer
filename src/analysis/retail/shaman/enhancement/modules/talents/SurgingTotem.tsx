import type { JSX } from 'react';
import styled from '@emotion/styled';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  GetRelatedEvent,
  HasRelatedEvent,
  RemoveBuffEvent,
  SummonEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon, SpellLink } from 'interface';
import { PassFailCheckmark, qualitativePerformanceToColor } from 'interface/guide';
import { formatDurationMillisMinSec } from 'common/format';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  computeScore,
  getAggregatedScore,
  scoreToQualitativePerformance,
  type ScoredCheck,
} from 'parser/ui/WeightedPerformance';
import GuideSection from 'interface/guide/components/GuideSection';
import CastOverview, { type StatisticData } from 'interface/guide/components/CastOverview';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';
import { EnhancementEventLinks } from '../../constants';
import HotHand from './HotHand';
import EventEmitter from 'parser/core/modules/EventEmitter';

const WhirlingStatValue = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 1.3rem;
  white-space: nowrap;
`;

const SURGING_TOTEM_DURATION_MS = 30_000;
const DOOM_WINDS_IN_POSITION_COLOR = '#3b9dff';

type WhirlingElement = 'earth' | 'fire' | 'air';

interface SurgingWindow {
  summon: SummonEvent;
  earth: ApplyBuffEvent | null;
  fire: ApplyBuffEvent | null;
  air: ApplyBuffEvent | null;
  airRemove: RemoveBuffEvent | null;
  catalyst: ApplyBuffEvent | null;
  doomWinds: ApplyBuffEvent | null;
  casts: CastEvent[];
}

class SurgingTotem extends Analyzer.withDependencies({
  hotHand: HotHand,
  eventEmitter: EventEmitter,
}) {
  private tracksHotHand = false;
  private windows: SurgingWindow[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT);
    this.tracksHotHand = this.selectedCombatant.hasTalent(TALENTS.HOT_HAND_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.SURGING_TOTEM),
      this.onSummon,
    );

    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.WHIRLING_EARTH,
          SPELLS.WHIRLING_FIRE,
          SPELLS.WHIRLING_AIR,
          SPELLS.PRIMAL_CATALYST_BUFF,
          SPELLS.DOOM_WINDS_BUFF,
        ]),
      this.onApplyBuffs,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  private get currentWindow(): SurgingWindow | null {
    return this.windows.length > 0 ? this.windows[this.windows.length - 1] : null;
  }

  private onSummon(event: SummonEvent) {
    this.windows.push({
      summon: event,
      earth: null,
      fire: null,
      air: null,
      airRemove: null,
      catalyst: null,
      doomWinds: null,
      casts: [],
    });
  }

  private onCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.SURGING_TOTEM.id) {
      return;
    }
    if (!event.globalCooldown && event.ability.guid !== TALENTS.DOOM_WINDS_TALENT.id) {
      return;
    }
    const window = this.currentWindow;
    if (!window) {
      return;
    }
    window.casts.push(event);
  }

  private onApplyBuffs(event: ApplyBuffEvent) {
    const window = this.currentWindow;
    if (!window) {
      return;
    }
    switch (event.ability.guid) {
      case SPELLS.WHIRLING_EARTH.id:
        window.earth = event;
        break;
      case SPELLS.WHIRLING_FIRE.id:
        window.fire = event;
        break;
      case SPELLS.WHIRLING_AIR.id:
        window.air = event;
        break;
      case SPELLS.PRIMAL_CATALYST_BUFF.id:
        window.catalyst = event;
        break;
      case SPELLS.DOOM_WINDS_BUFF.id:
        window.doomWinds ??= event;
        break;
    }
  }

  private resolveAirConsumer(window: SurgingWindow): CastEvent | undefined {
    if (!window.air) {
      return undefined;
    }
    const cast = GetRelatedEvent<CastEvent>(
      window.air,
      EnhancementEventLinks.WHIRLING_AIR_CONSUME_LINK,
    );
    if (!cast) {
      return undefined;
    }
    const trigger = GetRelatedEvent<CastEvent>(cast, EnhancementEventLinks.THORIMS_INVOCATION_LINK);
    if (trigger && window.casts.includes(trigger)) {
      return trigger;
    }
    if (window.casts.includes(cast)) {
      return cast;
    }
    return undefined;
  }

  private windowEnd(index: number) {
    const summonAt = this.windows[index].summon.timestamp;
    const nextSummonAt = this.windows[index + 1]?.summon.timestamp ?? Infinity;
    return Math.min(summonAt + SURGING_TOTEM_DURATION_MS, nextSummonAt, this.owner.fight.end_time);
  }

  private hotHandDuringWindow(index: number) {
    return this.deps.hotHand.activeDurationDuring(
      this.windows[index].summon.timestamp,
      this.windowEnd(index),
    );
  }

  private earthRowPerformance(position: number | null) {
    if (position === null) {
      return QualitativePerformance.Fail;
    }
    return position === 1 ? QualitativePerformance.Perfect : QualitativePerformance.Ok;
  }

  private fireRowPerformance(position: number | null) {
    if (position === null) {
      return QualitativePerformance.Fail;
    }
    return position === 2 ? QualitativePerformance.Perfect : QualitativePerformance.Ok;
  }

  private airRowPerformance(
    consumer: CastEvent | undefined,
    position: number | null,
  ): QualitativePerformance {
    if (!consumer || position === null) {
      return QualitativePerformance.Fail;
    }
    const inDw = this.selectedCombatant.hasBuff(SPELLS.DOOM_WINDS_BUFF.id, consumer.timestamp);
    const inOrder = position === 3;
    if (inOrder && inDw) {
      return QualitativePerformance.Perfect;
    }
    if (inOrder || inDw) {
      return QualitativePerformance.Good;
    }
    return QualitativePerformance.Ok;
  }

  private buildOverviewStats(): StatisticData[] {
    return [];
  }

  private spellToSequence(
    spell: Spell,
    timestamp: number,
    overlays: React.ReactNode[],
  ): CastInSequence {
    return {
      timestamp,
      spellId: spell.id,
      spellName: spell.name,
      icon: spell.icon,
      overlays,
    };
  }

  private castSlot(
    cast: CastEvent,
    performance: QualitativePerformance | undefined,
    overlays: React.ReactNode[],
  ): CastInSequence {
    return {
      timestamp: cast.timestamp,
      spellId: cast.ability.guid,
      spellName: cast.ability.name,
      icon: cast.ability.abilityIcon.replace('.jpg', ''),
      performance,
      overlays,
    };
  }

  private doomWindsSlot(cast: CastEvent, inPosition: boolean): CastInSequence {
    return {
      timestamp: cast.timestamp,
      spellId: cast.ability.guid,
      spellName: cast.ability.name,
      icon: cast.ability.abilityIcon.replace('.jpg', ''),
      performance: inPosition ? QualitativePerformance.Perfect : QualitativePerformance.Fail,
      outlineColor: inPosition
        ? DOOM_WINDS_IN_POSITION_COLOR
        : qualitativePerformanceToColor(QualitativePerformance.Fail),
    };
  }

  private ghostedDoomWinds(): CastInSequence {
    return {
      timestamp: 0,
      spellId: TALENTS.DOOM_WINDS_TALENT.id,
      spellName: TALENTS.DOOM_WINDS_TALENT.name,
      icon: TALENTS.DOOM_WINDS_TALENT.icon,
      performance: QualitativePerformance.Fail,
      ghosted: true,
    };
  }

  private expectedFillerCast(
    window: SurgingWindow,
    consumers: Partial<Record<WhirlingElement, CastEvent>>,
    doomWindsCast: CastEvent | undefined,
    timestamp: number,
  ): JSX.Element {
    let expected: React.ReactNode = <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} />;

    for (const element of ['earth', 'fire', 'air'] as WhirlingElement[]) {
      const applied = window[element];
      const consumer = consumers[element];
      const available =
        applied != null &&
        applied.timestamp <= timestamp &&
        (consumer == null || consumer.timestamp > timestamp);
      if (!available) {
        continue;
      }
      if (element === 'earth') {
        expected = <SpellLink spell={TALENTS.SUNDERING_TALENT} />;
      } else if (element === 'fire') {
        expected = <SpellLink spell={TALENTS.LAVA_LASH_TALENT} />;
      } else {
        const airConsumer = (
          <>
            <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> or{' '}
            <SpellLink spell={SPELLS.PRIMORDIAL_STORM_CAST} />
          </>
        );
        const doomWindsPending = doomWindsCast == null || doomWindsCast.timestamp > timestamp;
        expected = doomWindsPending ? (
          <>
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> &rarr; {airConsumer}
          </>
        ) : (
          airConsumer
        );
      }
      break;
    }

    return <>This cast should have been {expected}.</>;
  }

  private windowAnalysis(window: SurgingWindow) {
    const consumers: Partial<Record<WhirlingElement, CastEvent>> = {};
    let doomWindsCast: CastEvent | undefined;

    for (const cast of window.casts) {
      if (cast.ability.guid === TALENTS.DOOM_WINDS_TALENT.id) {
        doomWindsCast ??= cast;
        continue;
      }
      if (
        !consumers.earth &&
        HasRelatedEvent(cast, EnhancementEventLinks.WHIRLING_EARTH_CONSUME_LINK)
      ) {
        consumers.earth = cast;
      }
      if (
        !consumers.fire &&
        HasRelatedEvent(cast, EnhancementEventLinks.WHIRLING_FIRE_CONSUME_LINK)
      ) {
        consumers.fire = cast;
      }
    }

    consumers.air = this.resolveAirConsumer(window);

    const consumeOrder = (['earth', 'fire', 'air'] as WhirlingElement[])
      .filter((element) => consumers[element])
      .sort((a, b) => consumers[a]!.timestamp - consumers[b]!.timestamp);

    const positions: Record<WhirlingElement, number | null> = {
      earth: null,
      fire: null,
      air: null,
    };
    consumeOrder.forEach((element, index) => {
      positions[element] = index + 1;
    });

    const earthPerf = this.earthRowPerformance(positions.earth);
    const firePerf = this.fireRowPerformance(positions.fire);
    const airPerf = this.airRowPerformance(consumers.air, positions.air);

    const orderedConsumers = consumeOrder.map((element) => consumers[element]!);
    const lastConsumer = orderedConsumers[orderedConsumers.length - 1];
    let endTimestamp = lastConsumer ? lastConsumer.timestamp : window.summon.timestamp;

    if (doomWindsCast && doomWindsCast.timestamp > endTimestamp) {
      endTimestamp = doomWindsCast.timestamp;
    }

    const doomWindsInPosition =
      doomWindsCast != null &&
      consumers.fire != null &&
      doomWindsCast.timestamp >= consumers.fire.timestamp &&
      (consumers.air == null || doomWindsCast.timestamp <= consumers.air.timestamp);

    const sequence: CastInSequence[] = [
      {
        timestamp: window.summon.timestamp,
        spellId: SPELLS.SURGING_TOTEM.id,
        spellName: SPELLS.SURGING_TOTEM.name,
        icon: SPELLS.SURGING_TOTEM.icon,
      },
    ];

    let fillerCount = 0;
    let doomWindsShown = false;
    let firstConsumerSeen = false;

    for (const cast of window.casts) {
      if (cast.timestamp > endTimestamp) {
        break;
      }
      if (cast === consumers.earth) {
        firstConsumerSeen = true;
        sequence.push(
          this.castSlot(cast, earthPerf, [<SpellIcon spell={SPELLS.WHIRLING_EARTH} noLink />]),
        );
      } else if (cast === consumers.fire) {
        firstConsumerSeen = true;
        const overlays = [<SpellIcon spell={SPELLS.WHIRLING_FIRE} noLink />];
        if (window.catalyst) {
          overlays.push(<SpellIcon spell={SPELLS.PRIMAL_CATALYST_BUFF} noLink />);
        }
        sequence.push(this.castSlot(cast, firePerf, overlays));
      } else if (cast === consumers.air) {
        firstConsumerSeen = true;
        const overlays = [<SpellIcon spell={SPELLS.WHIRLING_AIR} noLink />];
        if (this.selectedCombatant.hasBuff(SPELLS.DOOM_WINDS_BUFF.id, cast.timestamp)) {
          overlays.push(<SpellIcon spell={SPELLS.DOOM_WINDS_BUFF} noLink />);
        }
        sequence.push(this.castSlot(cast, airPerf, overlays));
      } else if (cast === doomWindsCast) {
        doomWindsShown = true;
        sequence.push(this.doomWindsSlot(cast, doomWindsInPosition));
      } else if (firstConsumerSeen) {
        fillerCount += 1;
        const sequenceEntry = this.castSlot(cast, QualitativePerformance.Fail, []);
        sequenceEntry.tooltip = this.expectedFillerCast(
          window,
          consumers,
          doomWindsCast,
          cast.timestamp,
        );
        sequence.push(sequenceEntry);
      } else {
        sequence.push(this.castSlot(cast, undefined, []));
      }
    }

    if (window.earth && !consumers.earth) {
      sequence.push(this.expiredSlot(SPELLS.WHIRLING_EARTH, window.earth));
    }
    if (window.fire && !consumers.fire) {
      sequence.push(this.expiredSlot(SPELLS.WHIRLING_FIRE, window.fire));
    }
    if (window.air && !consumers.air) {
      sequence.push(this.expiredSlot(SPELLS.WHIRLING_AIR, window.air));
    }
    if (!doomWindsShown) {
      sequence.push(this.ghostedDoomWinds());
    }

    return {
      sequence,
      positions,
      earthPerf,
      firePerf,
      airPerf,
      doomWindsInPosition,
      doomWindsCast: doomWindsCast != null,
      fillerCount,
    };
  }

  private expiredSlot(buff: Spell, apply: ApplyBuffEvent): CastInSequence {
    return {
      timestamp: apply.timestamp,
      spellId: buff.id,
      spellName: buff.name,
      icon: buff.icon,
      performance: QualitativePerformance.Fail,
      ghosted: true,
    };
  }

  private orderLabel(position: number | null) {
    if (position !== null) {
      return position === 1 ? '1st' : position === 2 ? '2nd' : '3rd';
    }
    return 'Expired';
  }

  private whirlingStat(
    spell: Spell,
    position: number | null,
    idealPosition: number,
    performance: QualitativePerformance,
  ): PerCastStat {
    const correct = position === idealPosition;
    return {
      value: (
        <WhirlingStatValue>
          {spell.name} <PassFailCheckmark pass={correct} />
        </WhirlingStatValue>
      ),
      label: this.orderLabel(position),
      tooltip: correct ? null : position !== null ? (
        <>
          Used {this.orderLabel(position)} but should have been used{' '}
          {this.orderLabel(idealPosition)}.
        </>
      ) : (
        <>
          <SpellLink spell={spell} /> expired without being consumed.
        </>
      ),
      performance,
    };
  }

  private ordinalWord(position: number): string {
    return position === 1 ? 'first' : position === 2 ? 'second' : 'third';
  }

  private elementDetail(buff: Spell, consumer: Spell, position: number | null, ideal: number) {
    if (position === ideal) {
      return (
        <>
          Consumed <SpellLink spell={buff} /> {this.ordinalWord(ideal)} with{' '}
          <SpellLink spell={consumer} />.
        </>
      );
    }
    if (position === null) {
      return (
        <>
          <SpellLink spell={buff} /> expired unused - spend it {this.ordinalWord(ideal)} with{' '}
          <SpellLink spell={consumer} />.
        </>
      );
    }
    return (
      <>
        Consumed <SpellLink spell={buff} /> {this.ordinalWord(position)}, but it should be spent{' '}
        {this.ordinalWord(ideal)} with <SpellLink spell={consumer} />.
      </>
    );
  }

  private airDetail(position: number | null) {
    if (position === 3) {
      return (
        <>
          Consumed <SpellLink spell={SPELLS.WHIRLING_AIR} /> third under{' '}
          <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> with{' '}
          <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> or{' '}
          <SpellLink spell={SPELLS.PRIMORDIAL_STORM_CAST} />.
        </>
      );
    }
    if (position === null) {
      return (
        <>
          <SpellLink spell={SPELLS.WHIRLING_AIR} /> expired unused - spend it third under{' '}
          <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> with{' '}
          <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> or{' '}
          <SpellLink spell={SPELLS.PRIMORDIAL_STORM_CAST} />.
        </>
      );
    }
    return (
      <>
        Consumed <SpellLink spell={SPELLS.WHIRLING_AIR} /> {this.ordinalWord(position)}, but it
        should be spent third under <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} />.
      </>
    );
  }

  private doomWindsDetail(wasCast: boolean, inPosition: boolean) {
    if (inPosition) {
      return;
    }
    if (!wasCast) {
      return (
        <>
          <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> wasn't used - cast it immediately before
          your <SpellLink spell={SPELLS.WHIRLING_AIR} /> consumer.
        </>
      );
    }
    return (
      <>
        <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> was not cast immediately before the{' '}
        <SpellLink spell={SPELLS.WHIRLING_AIR} /> consumer.
      </>
    );
  }

  private consumeDetails(analysis: ReturnType<SurgingTotem['windowAnalysis']>): JSX.Element {
    const doomWindDetails = this.doomWindsDetail(
      analysis.doomWindsCast,
      analysis.doomWindsInPosition,
    );

    return (
      <>
        After each <SpellLink spell={SPELLS.SURGING_TOTEM} />, spend the{' '}
        <SpellLink spell={TALENTS.WHIRLING_ELEMENTS_TALENT} /> buffs in order:
        <ol>
          <li>
            {this.elementDetail(
              SPELLS.WHIRLING_EARTH,
              TALENTS.SUNDERING_TALENT,
              analysis.positions.earth,
              1,
            )}
          </li>
          <li>
            {this.elementDetail(
              SPELLS.WHIRLING_FIRE,
              TALENTS.LAVA_LASH_TALENT,
              analysis.positions.fire,
              2,
            )}
          </li>
          <li>{this.airDetail(analysis.positions.air)}</li>
          {doomWindDetails && <li>{doomWindDetails}</li>}
        </ol>
      </>
    );
  }

  private qpToScore(performance: QualitativePerformance): number {
    switch (performance) {
      case QualitativePerformance.Perfect:
        return 1;
      case QualitativePerformance.Good:
        return 0.75;
      case QualitativePerformance.Ok:
        return 0.5;
      case QualitativePerformance.Fail:
        return 0;
    }
  }

  private fillerScore(count: number): number {
    return computeScore(count, [
      { value: 0, score: 1 },
      { value: 1, score: 0.7 },
      { value: 3, score: 0.25 },
      { value: 6, score: 0 },
    ]);
  }

  private buildPerCastData(): PerCastData[] {
    return this.windows.map((window, index) => {
      const stats: PerCastData['stats'] = [];
      const checks: ScoredCheck[] = [];
      let sequence: CastInSequence[] | null = null;
      let details: JSX.Element | null = null;

      const analysis = this.windowAnalysis(window);
      sequence = analysis.sequence;
      details = this.consumeDetails(analysis);

      stats.push(
        this.whirlingStat(SPELLS.WHIRLING_EARTH, analysis.positions.earth, 1, analysis.earthPerf),
        this.whirlingStat(SPELLS.WHIRLING_FIRE, analysis.positions.fire, 2, analysis.firePerf),
        this.whirlingStat(SPELLS.WHIRLING_AIR, analysis.positions.air, 3, analysis.airPerf),
      );

      checks.push(
        { score: this.qpToScore(analysis.earthPerf), weight: 1 },
        { score: this.qpToScore(analysis.firePerf), weight: 1 },
        { score: this.qpToScore(analysis.airPerf), weight: 1 },
        { score: analysis.doomWindsInPosition ? 1 : 0, weight: 1 },
        { score: this.fillerScore(analysis.fillerCount), weight: 2 },
      );

      if (this.tracksHotHand) {
        const hotHandMs = this.hotHandDuringWindow(index);
        const hotHandPerf = this.deps.hotHand.extensionPerformanceDuring(
          window.summon.timestamp,
          this.windowEnd(index),
        );
        if (hotHandPerf !== null) {
          checks.push({ score: this.qpToScore(hotHandPerf), weight: 1 });
        }
        stats.push({
          value: formatDurationMillisMinSec(hotHandMs, 1),
          label: 'Hot Hand',
          tooltip: (
            <>
              Time <SpellLink spell={TALENTS.HOT_HAND_TALENT} /> was active. Rating reflects{' '}
              <SpellLink spell={TALENTS.TOTEMIC_MOMENTUM_TALENT} /> extension efficiency.
            </>
          ),
          performance: hotHandPerf ?? undefined,
        });
      }

      const result: PerCastData = {
        performance:
          checks.length > 0
            ? scoreToQualitativePerformance(getAggregatedScore(checks))
            : QualitativePerformance.Perfect,
        timestamp: this.owner.formatTimestamp(window.summon.timestamp),
        stats,
      };

      result.additionalContent = {
        title: 'Consume Sequence',
        content: <SpellSequence casts={sequence} iconSize={48} />,
      };
      result.details = details;

      return result;
    });
  }

  private description(): JSX.Element {
    return (
      <>
        <p>
          Keep{' '}
          <strong>
            <SpellLink spell={SPELLS.SURGING_TOTEM} />
          </strong>
          , <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} />, and{' '}
          <SpellLink spell={TALENTS.SUNDERING_TALENT} /> in sync. Any drfit can have major impacts
          on your damage output.
        </p>

        <p>
          After each <SpellLink spell={SPELLS.SURGING_TOTEM} />, execute in order:{' '}
          <ol>
            <li>
              <SpellLink spell={TALENTS.SUNDERING_TALENT} /> (consume{' '}
              <SpellLink spell={SPELLS.WHIRLING_EARTH} />
              ).
            </li>
            <li>
              <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> (consume{' '}
              <SpellLink spell={SPELLS.WHIRLING_FIRE} />
              ).
            </li>
            <li>
              <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> &rarr; Consume{' '}
              <SpellLink spell={SPELLS.WHIRLING_AIR} /> immediately, ideally with
              <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> or{' '}
              <SpellLink spell={SPELLS.PRIMORDIAL_STORM_CAST} />.
            </li>
          </ol>
        </p>
        <p>An example sequence may look something like this:</p>
        <p>
          <SpellIcon spell={SPELLS.SURGING_TOTEM} /> &rarr;
          <SpellIcon spell={TALENTS.SUNDERING_TALENT} /> &rarr;
          <SpellIcon spell={TALENTS.LAVA_LASH_TALENT} /> &rarr;
          <SpellIcon spell={TALENTS.DOOM_WINDS_TALENT} /> &rarr;
          <SpellIcon spell={TALENTS.CRASH_LIGHTNING_TALENT} />
        </p>
      </>
    );
  }

  get guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const children: JSX.Element[] = [
      <CastOverview
        key="overview"
        spell={SPELLS.SURGING_TOTEM}
        stats={this.buildOverviewStats()}
      />,
    ];

    if (this.tracksHotHand && this.windows.length > 0) {
      children.push(
        <CastDetail key="windows" title="Surging Totem Windows" casts={this.buildPerCastData()} />,
      );
    }

    return (
      <GuideSection spell={SPELLS.SURGING_TOTEM} explanation={this.description()}>
        {children}
      </GuideSection>
    );
  }
}

export default SurgingTotem;
