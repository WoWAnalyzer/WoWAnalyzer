import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvent,
  SummonEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon, SpellLink } from 'interface';
import { formatDurationMillisMinSec, formatPercentage } from 'common/format';
import {
  evaluateQualitativePerformanceByThreshold,
  getAveragePerf,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import GuideSection from 'interface/guide/components/GuideSection';
import CastOverview, { type StatisticData } from 'interface/guide/components/CastOverview';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import {
  SpellSequence,
  type CastInSequence,
  type CastOverlay,
} from 'interface/guide/components/CastSequence';
import { EnhancementEventLinks } from '../../constants';
import HotHand from './HotHand';

const SURGING_TOTEM_DURATION_MS = 30_000;
const SURGING_TOTEM_COOLDOWN_MS = 60_000;
const MAX_UPTIME = SURGING_TOTEM_DURATION_MS / SURGING_TOTEM_COOLDOWN_MS; // 0.5

interface SurgingWindow {
  summon: SummonEvent;
  earth: ApplyBuffEvent | null;
  fire: ApplyBuffEvent | null;
  air: ApplyBuffEvent | null;
  catalyst: ApplyBuffEvent | null;
}

class SurgingTotem extends Analyzer.withDependencies({ hotHand: HotHand }) {
  private tracksWhirlingElements = false;
  private tracksHotHand = false;
  private windows: SurgingWindow[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT);
    this.tracksWhirlingElements = this.selectedCombatant.hasTalent(
      TALENTS.WHIRLING_ELEMENTS_TALENT,
    );
    this.tracksHotHand = this.selectedCombatant.hasTalent(TALENTS.HOT_HAND_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.SURGING_TOTEM),
      this.onSummon,
    );

    if (this.tracksWhirlingElements) {
      this.addEventListener(
        Events.applybuff
          .by(SELECTED_PLAYER)
          .spell([
            SPELLS.WHIRLING_EARTH,
            SPELLS.WHIRLING_FIRE,
            SPELLS.WHIRLING_AIR,
            SPELLS.PRIMAL_CATALYST_BUFF,
          ]),
        this.onWhirlingApply,
      );
    }
  }

  private get summonCount() {
    return this.windows.length;
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
      catalyst: null,
    });
  }

  private onWhirlingApply(event: ApplyBuffEvent) {
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
    }
  }

  private getConsumer(apply: ApplyBuffEvent | null, link: EnhancementEventLinks) {
    if (!apply) {
      return undefined;
    }
    return GetRelatedEvent<CastEvent>(apply, link, (e) => e.type === EventType.Cast);
  }

  private earthConsumer(window: SurgingWindow) {
    return this.getConsumer(window.earth, EnhancementEventLinks.WHIRLING_EARTH_CONSUME_LINK);
  }

  private fireConsumer(window: SurgingWindow) {
    return this.getConsumer(window.fire, EnhancementEventLinks.WHIRLING_FIRE_CONSUME_LINK);
  }

  private airConsumer(window: SurgingWindow) {
    return this.getConsumer(window.air, EnhancementEventLinks.WHIRLING_AIR_CONSUME_LINK);
  }

  // End of a window's totem coverage: capped at the 30s duration, but cut
  // short if the totem was overwritten by a later summon or the fight ended.
  private windowEnd(index: number) {
    const summonAt = this.windows[index].summon.timestamp;
    const nextSummonAt = this.windows[index + 1]?.summon.timestamp ?? Infinity;
    return Math.min(summonAt + SURGING_TOTEM_DURATION_MS, nextSummonAt, this.owner.fight.end_time);
  }

  private get totalActiveDuration() {
    let total = 0;
    for (let i = 0; i < this.windows.length; i++) {
      total += this.windowEnd(i) - this.windows[i].summon.timestamp;
    }
    return total;
  }

  private get uptime() {
    return this.owner.fightDuration > 0 ? this.totalActiveDuration / this.owner.fightDuration : 0;
  }

  private get uptimeRatioOfMax() {
    return MAX_UPTIME > 0 ? this.uptime / MAX_UPTIME : 0;
  }

  private get uptimePerformance(): QualitativePerformance {
    return evaluateQualitativePerformanceByThreshold({
      actual: this.uptimeRatioOfMax,
      isGreaterThanOrEqual: {
        perfect: 0.96,
        good: 0.9,
        ok: 0.8,
      },
    });
  }

  private hotHandDuringWindow(index: number) {
    return this.deps.hotHand.activeDurationDuring(
      this.windows[index].summon.timestamp,
      this.windowEnd(index),
    );
  }

  // Returns 1, 2, or 3 indicating the chronological order each Whirling buff
  // was consumed within this Surging Totem window. null = no consumer.
  private windowConsumeOrder(window: SurgingWindow) {
    const earth = this.earthConsumer(window);
    const fire = this.fireConsumer(window);
    const air = this.airConsumer(window);

    const entries: { kind: 'earth' | 'fire' | 'air'; timestamp: number }[] = [];
    if (earth) {
      entries.push({ kind: 'earth', timestamp: earth.timestamp });
    }
    if (fire) {
      entries.push({ kind: 'fire', timestamp: fire.timestamp });
    }
    if (air) {
      entries.push({ kind: 'air', timestamp: air.timestamp });
    }
    entries.sort((a, b) => a.timestamp - b.timestamp);

    const positions = new Map<string, number>();
    entries.forEach((e, i) => positions.set(e.kind, i + 1));

    return {
      earth: positions.get('earth') ?? null,
      fire: positions.get('fire') ?? null,
      air: positions.get('air') ?? null,
    };
  }

  // Position-aware row performance — ideal positions are Earth=1, Fire=2, Air=3.
  // Air additionally requires the consume to happen inside Doom Winds for Perfect.
  private earthRowPerformance(window: SurgingWindow, position: number | null) {
    if (position === null) {
      return QualitativePerformance.Fail;
    }
    return position === 1 ? QualitativePerformance.Perfect : QualitativePerformance.Ok;
  }

  private fireRowPerformance(window: SurgingWindow, position: number | null) {
    if (position === null) {
      return QualitativePerformance.Fail;
    }
    return position === 2 ? QualitativePerformance.Perfect : QualitativePerformance.Ok;
  }

  private airRowPerformance(
    window: SurgingWindow,
    position: number | null,
  ): QualitativePerformance {
    const consumer = this.airConsumer(window);
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
    return [
      {
        value: `${this.summonCount}`,
        label: 'Total Summons',
        tooltip: (
          <>
            Total <SpellLink spell={SPELLS.SURGING_TOTEM} /> casts during the fight.
          </>
        ),
      },
      {
        value: `${formatPercentage(this.uptime, 1)}%`,
        label: 'Uptime',
        tooltip: (
          <>
            Percentage of the fight with an active <SpellLink spell={SPELLS.SURGING_TOTEM} />. The
            totem lasts 30s on a 60s cooldown, so the maximum possible uptime is{' '}
            {formatPercentage(MAX_UPTIME, 0)}%.
          </>
        ),
        performance: this.uptimePerformance,
      },
    ];
  }

  private overlayFor(spell: Spell): CastOverlay {
    return {
      spellId: spell.id,
      spellName: spell.name,
      icon: spell.icon,
    };
  }

  private spellToSequence(
    spell: Spell,
    timestamp: number,
    overlays: CastOverlay[],
  ): CastInSequence {
    return {
      timestamp,
      spellId: spell.id,
      spellName: spell.name,
      icon: spell.icon,
      overlays,
    };
  }

  // Builds the visual cast sequence in chronological order so it agrees with
  // the position labels. ST is always first, then consumers in actual cast
  // order, then ghosted slots for any buffs that applied but were never
  // consumed.
  private buildWindowSequence(
    window: SurgingWindow,
    order: ReturnType<typeof this.windowConsumeOrder>,
  ): CastInSequence[] {
    const items: CastInSequence[] = [
      this.spellToSequence(SPELLS.SURGING_TOTEM, window.summon.timestamp, []),
    ];

    const earth = this.earthConsumer(window);
    const fire = this.fireConsumer(window);
    const air = this.airConsumer(window);

    const consumers: CastInSequence[] = [];

    if (earth) {
      consumers.push({
        timestamp: earth.timestamp,
        spellId: earth.ability.guid,
        spellName: earth.ability.name,
        icon: earth.ability.abilityIcon.replace('.jpg', ''),
        performance: this.earthRowPerformance(window, order.earth),
        overlays: [this.overlayFor(SPELLS.WHIRLING_EARTH)],
        tooltip: (
          <div>
            <strong>{earth.ability.name}</strong> consumed{' '}
            <SpellLink spell={SPELLS.WHIRLING_EARTH} /> ({this.orderLabel(order.earth)})
          </div>
        ),
      });
    }

    if (fire) {
      const overlays = [this.overlayFor(SPELLS.WHIRLING_FIRE)];
      if (window.catalyst) {
        overlays.push(this.overlayFor(SPELLS.PRIMAL_CATALYST_BUFF));
      }
      consumers.push({
        timestamp: fire.timestamp,
        spellId: fire.ability.guid,
        spellName: fire.ability.name,
        icon: fire.ability.abilityIcon.replace('.jpg', ''),
        performance: this.fireRowPerformance(window, order.fire),
        overlays,
        tooltip: (
          <div>
            <strong>{fire.ability.name}</strong> consumed <SpellLink spell={SPELLS.WHIRLING_FIRE} />
            {window.catalyst && (
              <>
                {' '}
                and <SpellLink spell={SPELLS.PRIMAL_CATALYST_BUFF} />
              </>
            )}{' '}
            ({this.orderLabel(order.fire)})
          </div>
        ),
      });
    }

    if (air) {
      const inDw = this.selectedCombatant.hasBuff(SPELLS.DOOM_WINDS_BUFF.id, air.timestamp);
      const overlays = [this.overlayFor(SPELLS.WHIRLING_AIR)];
      if (inDw) {
        overlays.push(this.overlayFor(SPELLS.DOOM_WINDS_BUFF));
      }
      consumers.push({
        timestamp: air.timestamp,
        spellId: air.ability.guid,
        spellName: air.ability.name,
        icon: air.ability.abilityIcon.replace('.jpg', ''),
        performance: this.airRowPerformance(window, order.air),
        overlays,
        tooltip: (
          <div>
            <strong>{air.ability.name}</strong> consumed <SpellLink spell={SPELLS.WHIRLING_AIR} />
            {inDw && (
              <>
                {' '}
                inside <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} />
              </>
            )}{' '}
            ({this.orderLabel(order.air)})
          </div>
        ),
      });
    }

    consumers.sort((a, b) => a.timestamp - b.timestamp);
    items.push(...consumers);

    // Trailing ghosted slots for applied-but-unconsumed buffs.
    if (window.earth && !earth) {
      items.push(this.expiredSlot(SPELLS.WHIRLING_EARTH, window.earth));
    }
    if (window.fire && !fire) {
      items.push(this.expiredSlot(SPELLS.WHIRLING_FIRE, window.fire));
    }
    if (window.air && !air) {
      items.push({
        timestamp: window.air.timestamp,
        spellId: SPELLS.WHIRLING_AIR.id,
        spellName: SPELLS.WHIRLING_AIR.name,
        icon: SPELLS.WHIRLING_AIR.icon,
        performance: QualitativePerformance.Fail,
        ghosted: true,
        tooltip: (
          <div>
            <SpellLink spell={SPELLS.WHIRLING_AIR} /> expired without being consumed.
          </div>
        ),
      });
    }

    return items;
  }

  private expiredSlot(buff: Spell, apply: ApplyBuffEvent): CastInSequence {
    return {
      timestamp: apply.timestamp,
      spellId: buff.id,
      spellName: buff.name,
      icon: buff.icon,
      performance: QualitativePerformance.Fail,
      ghosted: true,
      tooltip: (
        <div>
          <SpellLink spell={buff} /> expired without being consumed.
        </div>
      ),
    };
  }

  private orderLabel(position: number | null) {
    if (position !== null) {
      return position === 1 ? '1st' : position === 2 ? '2nd' : '3rd';
    }
    return 'Expired';
  }

  private buildPerCastData(): PerCastData[] {
    return this.windows.map((window, index) => {
      const order = this.windowConsumeOrder(window);
      const stats: PerCastData['stats'] = [];
      const performances: QualitativePerformance[] = [];

      if (this.tracksWhirlingElements) {
        const earth = this.earthConsumer(window);
        const fire = this.fireConsumer(window);
        const air = this.airConsumer(window);

        const earthPerf = this.earthRowPerformance(window, order.earth);
        const firePerf = this.fireRowPerformance(window, order.fire);
        const airPerf = this.airRowPerformance(window, order.air);
        performances.push(earthPerf, firePerf, airPerf);

        stats.push(
          {
            value: this.orderLabel(order.earth),
            label: 'Whirling Earth',
            tooltip: (
              <>
                <SpellLink spell={SPELLS.WHIRLING_EARTH} />{' '}
                {earth ? <>was consumed.</> : <>expired without being consumed.</>}
              </>
            ),
            performance: earthPerf,
          },
          {
            value: this.orderLabel(order.fire),
            label: 'Whirling Fire',
            tooltip: (
              <>
                <SpellLink spell={SPELLS.WHIRLING_FIRE} />{' '}
                {fire ? (
                  <>
                    was consumed
                    {window.catalyst && (
                      <>
                        {' '}
                        with <SpellLink spell={SPELLS.PRIMAL_CATALYST_BUFF} />
                      </>
                    )}
                    .
                  </>
                ) : (
                  <>expired without being consumed.</>
                )}
              </>
            ),
            performance: firePerf,
          },
          {
            value: this.orderLabel(order.air),
            label: 'Whirling Air',
            tooltip: (
              <>
                <SpellLink spell={SPELLS.WHIRLING_AIR} />{' '}
                {air ? (
                  <>
                    was consumed by <SpellLink spell={air.ability.guid} />.
                  </>
                ) : (
                  <>expired without being consumed.</>
                )}
              </>
            ),
            performance: airPerf,
          },
        );
      }

      if (this.tracksHotHand) {
        const hotHandMs = this.hotHandDuringWindow(index);
        const hotHandPerf = this.deps.hotHand.extensionPerformanceDuring(
          window.summon.timestamp,
          this.windowEnd(index),
        );
        if (hotHandPerf !== null) {
          performances.push(hotHandPerf);
        }
        stats.push({
          value: formatDurationMillisMinSec(hotHandMs, 1),
          label: 'Hot Hand',
          tooltip: (
            <>
              Time <SpellLink spell={TALENTS.HOT_HAND_TALENT} /> was active during this{' '}
              <SpellLink spell={SPELLS.SURGING_TOTEM} /> window. Rating reflects{' '}
              <SpellLink spell={TALENTS.TOTEMIC_MOMENTUM_TALENT} /> extension efficiency.
            </>
          ),
          performance: hotHandPerf ?? undefined,
        });
      }

      const result: PerCastData = {
        performance:
          performances.length > 0 ? getAveragePerf(performances) : QualitativePerformance.Perfect,
        timestamp: this.owner.formatTimestamp(window.summon.timestamp),
        detailsIcon: null,
        stats,
      };

      if (this.tracksWhirlingElements) {
        result.additionalContent = {
          title: 'Consume Sequence',
          content: <SpellSequence casts={this.buildWindowSequence(window, order)} iconSize={48} />,
        };
      }

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
          <SpellLink spell={TALENTS.SUNDERING_TALENT} /> in sync. Drifting any of them apart costs
          you a full <SpellLink spell={TALENTS.WHIRLING_ELEMENTS_TALENT} /> window's worth of
          damage.
        </p>
        {this.tracksWhirlingElements && (
          <>
            <p>
              After each <SpellLink spell={SPELLS.SURGING_TOTEM} />, execute in order:{' '}
              <SpellLink spell={TALENTS.SUNDERING_TALENT} /> →{' '}
              <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> → save{' '}
              <SpellLink spell={SPELLS.WHIRLING_AIR} /> for the next{' '}
              <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> or{' '}
              <SpellLink spell={SPELLS.PRIMORDIAL_STORM_CAST} /> inside{' '}
              <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} />.
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
        )}
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

    if ((this.tracksWhirlingElements || this.tracksHotHand) && this.windows.length > 0) {
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
