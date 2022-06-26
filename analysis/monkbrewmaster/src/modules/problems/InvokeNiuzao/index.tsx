import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { ControlledExpandable, SpellLink } from 'interface';
import { GuideProps, PassFailBar, Section, SectionHeader, SubSection } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  CastEvent,
  DamageEvent,
  DeathEvent,
  EventType,
  FightEndEvent,
  RemoveStaggerEvent,
  SummonEvent,
} from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Enemies from 'parser/shared/modules/Enemies';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BaseChart, { defaultConfig } from 'parser/ui/BaseChart';
import { useState } from 'react';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';
import { Field } from 'vega-lite/build/src/channeldef';
import { UnitSpec } from 'vega-lite/build/src/spec';

import {
  color,
  line,
  normalizeTimestampTransform,
  point,
  timeAxis,
  staggerAxis,
} from '../../charts';

const RECENT_PURIFY_WINDOW = 6000;

const NIUZAO_PET_BUFF_IDS = new Set([
  SPELLS.CTA_INVOKE_NIUZAO_BUFF.id, // real niuzao
  SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id, // cta niuzao
]);

type NiuzaoCastData = {
  prePurified: RemoveStaggerEvent[];
  purifyingAtCast: {
    charges: number;
    cooldown: number;
  };
  purifyStompContribution: number;
  stompDamage: number;
  purifies: RemoveStaggerEvent[];
  stomps: StompData[];
  startEvent: SummonEvent;
  endEvent: DeathEvent | FightEndEvent;
  relevantHits: DamageEvent[];
};

type StompData = {
  event: CastEvent;
  damage: DamageEvent[];
  purifies: RemoveStaggerEvent[];
};

export class InvokeNiuzao extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    enemies: Enemies,
  };

  protected spellUsable!: SpellUsable;
  protected enemies!: Enemies;

  readonly casts: NiuzaoCastData[] = [];
  private activeCasts: Record<number, Omit<NiuzaoCastData, 'endEvent'>> = {};

  private recentPurifies: RemoveStaggerEvent[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(EventType.RemoveStagger, this.removeStagger);
    this.addEventListener(
      Events.damage.spell(SPELLS.NIUZAO_STOMP_DAMAGE).by(SELECTED_PLAYER_PET),
      this.stompDamage,
    );
    this.addEventListener(
      Events.cast.spell(SPELLS.NIUZAO_STOMP_DAMAGE).by(SELECTED_PLAYER_PET),
      this.stompCast,
    );

    // we may have multiple niuzaos active at once because of Call to Arms. handle it using summon/death rather than buffs
    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onSummon);

    this.addEventListener(EventType.Death, this.onDeath);

    this.addEventListener(Events.fightend, this.endNiuzao);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamage);
  }

  private onDamage(event: DamageEvent) {
    if (shouldIgnore(this.enemies, event)) {
      return;
    }

    Object.values(this.activeCasts).forEach((cast) => cast.relevantHits.push(event));
  }

  private removeStagger(event: RemoveStaggerEvent) {
    if (event.trigger?.ability.guid !== SPELLS.PURIFYING_BREW.id) {
      return;
    }

    this.recentPurifies.push(event);
    Object.values(this.activeCasts).forEach((data) => {
      data.purifies!.push(event);
    });
  }

  private onSummon(event: SummonEvent) {
    const petId = event.ability.guid;
    if (!NIUZAO_PET_BUFF_IDS.has(petId)) {
      return;
    }

    this.activeCasts[event.targetID] = this.constructCastData(event);
  }

  private onDeath(event: DeathEvent) {
    const active = this.activeCasts[event.targetID] as NiuzaoCastData | undefined;
    delete this.activeCasts[event.targetID];

    if (active) {
      active.endEvent = event;
      this.casts.push(active);
    }
  }

  private endNiuzao(event: FightEndEvent) {
    Object.values(this.activeCasts).forEach((cast) => {
      const active = cast as NiuzaoCastData;
      active.endEvent = event;
      this.casts.push(active);
    });

    this.activeCasts = {};
  }

  private stompCast(event: CastEvent) {
    const purifies = this.retrieveRecentPurifies(event.timestamp);
    this.resetRecentlyPurified();

    const cast = this.activeCasts[event.sourceID ?? -1];

    if (cast === undefined) {
      console.warn('Stomp found with no niuzao active', event, purifies);
      return;
    }

    cast.stomps!.push({
      event,
      purifies,
      damage: [],
    });
  }

  private stompDamage(event: DamageEvent) {
    const cast = this.activeCasts[event.sourceID ?? -1];
    if (!cast) {
      return;
    }

    const stomp = cast.stomps![cast.stomps!.length - 1];
    if (stomp === undefined || event.timestamp - stomp.event.timestamp > 250) {
      return;
    }

    stomp.damage.push(event);
  }

  /**
   * Retrieve the amount of recently purified damage
   */
  private retrieveRecentPurifies(now: number) {
    return this.recentPurifies.filter(({ timestamp }) => now - timestamp < RECENT_PURIFY_WINDOW);
  }

  private resetRecentlyPurified() {
    this.recentPurifies = [];
  }

  private constructCastData(summonEvent: SummonEvent): Omit<NiuzaoCastData, 'endEvent'> {
    const prePurified = this.retrieveRecentPurifies(summonEvent.timestamp);
    return {
      prePurified,
      get purifyStompContribution() {
        return this.stomps.reduce(
          (total, { purifies }) =>
            total + purifies.reduce((total, { amount }) => total + amount, 0),
          0,
        );
      },
      get stompDamage() {
        return this.stomps
          .flatMap((stomp) => stomp.damage)
          .reduce((total, { amount }) => total + amount, 0);
      },
      purifies: [],
      stomps: [],
      relevantHits: [],
      purifyingAtCast: {
        charges: this.spellUsable.chargesAvailable(SPELLS.PURIFYING_BREW.id),
        cooldown: this.spellUsable.cooldownRemaining(SPELLS.PURIFYING_BREW.id),
      },
      startEvent: summonEvent,
    };
  }
}

const NIUZAO_BUFF_ID_TO_CAST = {
  [SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id]: SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id,
  [SPELLS.CTA_INVOKE_NIUZAO_BUFF.id]: SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id,
};

const MAX_STOMPS = {
  [SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id]: 5,
  [SPELLS.CTA_INVOKE_NIUZAO_BUFF.id]: 3,
};

const TARGET_PURIFIES = {
  [SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id]: 6,
  [SPELLS.CTA_INVOKE_NIUZAO_BUFF.id]: 4,
};

type CommonProps = { cast: NiuzaoCastData; info: Info; events: AnyEvent[] };

function NiuzaoChecklistHeader({ cast, info }: Pick<CommonProps, 'cast' | 'info'>): JSX.Element {
  return (
    <SectionHeader>
      {formatDuration(cast.startEvent.timestamp - info.fightStart)} &mdash;{' '}
      <SpellLink id={NIUZAO_BUFF_ID_TO_CAST[cast.startEvent.ability.guid]} /> (
      {formatNumber(cast.stompDamage)})
    </SectionHeader>
  );
}

function InvokeNiuzaoSummaryChart({ cast, info, events: allEvents }: CommonProps): JSX.Element {
  const startTime = cast.startEvent.timestamp - 8000;
  const endTime = cast.endEvent.timestamp + 2000;
  const events = allEvents.filter(
    ({ timestamp }) => timestamp >= startTime && timestamp <= endTime,
  );

  const davePool = cast.stomps.flatMap(({ purifies, event }, index) => [
    ...purifies.reduce((result, { timestamp, amount }) => {
      const prevAmount = result.length > 0 ? result[result.length - 1].amount : 0;
      const next = {
        timestamp,
        amount: prevAmount + amount / 4,
        stomp: index,
      };
      result.push(next);
      return result;
    }, [] as Array<{ timestamp: number; amount: number; stomp: number }>),
    {
      timestamp: event.timestamp,
      amount: 0,
      stomp: index,
      fake: true,
    },
  ]);

  const data = {
    stagger: events.filter(
      ({ type }) => type === EventType.RemoveStagger || type === EventType.AddStagger,
    ),
    purifies: events
      .filter(
        (event) =>
          event.type === EventType.RemoveStagger &&
          event.trigger?.ability.guid === SPELLS.PURIFYING_BREW.id,
      )
      .map((e) => {
        const event = e as RemoveStaggerEvent;
        const other = davePool.find(({ timestamp }) => timestamp === event.timestamp);
        return {
          ...event,
          newPooledDamage: event.newPooledDamage + event.amount,
          hasStomp: other !== undefined,
          stomp: other?.stomp ?? -1,
        };
      }),
    davePool,
    stomps: cast.stomps.map((stomp, index) => ({
      timestamp: stomp.event.timestamp,
      amount: stomp.damage.reduce((total, { amount }) => total + amount, 0),
      stomp: index,
    })),
    window: [
      {
        timestamp: cast.startEvent.timestamp,
        end: cast.endEvent.timestamp,
      },
    ],
  };

  const windowSpec: UnitSpec<Field> = {
    data: {
      name: 'window',
    },
    mark: {
      type: 'rect',
      color: 'lightblue',
      opacity: 0.3,
    },
    transform: [
      normalizeTimestampTransform(info),
      {
        calculate: `datum.end - ${info.fightStart}`,
        as: 'end',
      },
    ],
    encoding: {
      x2: {
        ...timeAxis,
        field: 'end',
      },
    },
  };

  const scale = {
    zero: false,
    nice: false,
    domain: [
      events[0].timestamp - info.fightStart,
      events[events.length - 1].timestamp - info.fightStart,
    ],
  };

  const highlightSelection = {
    condition: {
      param: 'selectedStomp',
      empty: false,
      value: 'white',
    },
    value: 'transparent',
  };

  const stompSelection = {
    params: [
      {
        name: 'selectedStomp',
        select: { type: 'point', on: 'mouseover', fields: ['stomp'] },
      },
    ],
  };

  const specBuilder = (width: number, height: number): VisualizationSpec => ({
    vconcat: [
      {
        height: height / 2 - 20,
        width,
        encoding: {
          x: {
            ...timeAxis,
            scale,
            axis: null,
          },
        },
        layer: [
          windowSpec,
          {
            ...line('stagger', color.stagger),
            transform: [normalizeTimestampTransform(info)],
            encoding: { y: { ...staggerAxis, title: 'Stagger' } },
          },
          {
            ...stompSelection,
            ...point('purifies', color.purify),
            transform: [
              normalizeTimestampTransform(info),
              {
                calculate: 'if(datum.hasStomp, "Yes", "No")',
                as: 'readableHasStomp',
              },
            ],
            encoding: {
              y: { ...staggerAxis, title: 'Stagger' },
              stroke: highlightSelection,
              color: {
                field: 'hasStomp',
                type: 'nominal',
                legend: null,
                scale: {
                  domain: [false, true],
                  range: ['white', color.purify],
                },
              },
              tooltip: [
                {
                  field: 'amount',
                  type: 'quantitative',
                  format: '.3~s',
                  title: 'Amount Purified',
                },
                {
                  field: 'readableHasStomp',
                  type: 'nominal',
                  title: 'Buffed a Stomp',
                },
              ],
            },
          },
        ],
      },
      {
        height: height / 2 - 20,
        width,
        encoding: {
          x: {
            ...timeAxis,
            scale,
          },
        },
        layer: [
          windowSpec,
          {
            ...line('davePool', 'white'),
            transform: [normalizeTimestampTransform(info)],
            encoding: {
              y: {
                title: 'Stomp',
                type: 'quantitative',
                axis: {
                  gridOpacity: 0.3,
                  format: '~s',
                },
                field: 'amount',
              },
            },
          },
          {
            ...point('davePool', color.purify),
            transform: [
              normalizeTimestampTransform(info),
              {
                filter: '!datum.fake',
              },
            ],
            encoding: {
              stroke: highlightSelection,
              y: {
                title: 'Stomp',
                type: 'quantitative',
                axis: {
                  gridOpacity: 0.3,
                  format: '~s',
                },
                field: 'amount',
              },
              tooltip: [
                {
                  field: 'amount',
                  type: 'quantitative',
                  title: 'Stomp Contribution',
                  format: '.3~s',
                },
              ],
            },
          },
          {
            ...stompSelection,
            data: { name: 'stomps' },
            mark: {
              type: 'bar',
              color: 'hsl(25.9, 25%, 50.5%)',
            },
            transform: [normalizeTimestampTransform(info)],
            encoding: {
              y: {
                type: 'quantitative',
                axis: {
                  gridOpacity: 0.3,
                  format: '~s',
                },
                field: 'amount',
              },
              stroke: highlightSelection,
              tooltip: [
                {
                  title: 'Damage',
                  field: 'amount',
                  type: 'quantitative',
                  format: '.3~s',
                },
              ],
            },
          },
        ],
      },
    ],
  });

  return (
    <AutoSizer>
      {({ width, height }) => (
        <BaseChart
          data={data}
          spec={/* HACK: not sure why this doubles the width */ specBuilder(width / 2 - 30, height)}
          config={{
            ...defaultConfig,
            autosize: {
              type: 'pad',
              contains: 'padding',
            },
          }}
        />
      )}
    </AutoSizer>
  );
}

const PassFailCheckmark = ({ pass }: { pass: boolean }) =>
  pass ? (
    <i className="glyphicon glyphicon-ok" style={{ color: color.purify }} />
  ) : (
    <i className="glyphicon glyphicon-remove" style={{ color: 'red' }} />
  );

const GUESS_MAX_HP = 100000;

function InvokeNiuzaoChecklist({ events, cast, info }: CommonProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <ControlledExpandable
      header={<NiuzaoChecklistHeader cast={cast} info={info} />}
      element="section"
      expanded={isExpanded}
      inverseExpanded={() => setIsExpanded(!isExpanded)}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'max-content 1fr',
          gridColumnGap: '1em',
          alignItems: 'start',
        }}
      >
        <div>
          <section>
            <header style={{ fontWeight: 'bold' }}>Checklist</header>
            <table className="hits-list">
              <tbody>
                <tr>
                  <td>Purified Before Casting</td>
                  <td>
                    <PassFailCheckmark pass={cast.prePurified.length > 0} />
                  </td>
                </tr>
                <tr>
                  <td>
                    Started with 1+ <SpellLink id={SPELLS.PURIFYING_BREW.id} /> Charge
                  </td>
                  <td>
                    <PassFailCheckmark pass={cast.purifyingAtCast.charges >= 1} />
                  </td>
                  <td>
                    ({cast.purifyingAtCast.charges} charges
                    {cast.purifyingAtCast.charges < 2 && (
                      <>, {(cast.purifyingAtCast.cooldown / 1000).toFixed(1)}s til next</>
                    )}
                    )
                  </td>
                </tr>
                <tr>
                  <td>Was Actively Tanking</td>
                  <td>
                    <PassFailCheckmark
                      pass={
                        cast.relevantHits.reduce(
                          (total, { unmitigatedAmount, amount, maxHitPoints }) =>
                            total + (unmitigatedAmount ?? amount) / (maxHitPoints ?? GUESS_MAX_HP),
                          0,
                        ) >= 1 ||
                        cast.purifies.reduce((total, { amount }) => total + amount, 0) >
                          GUESS_MAX_HP
                      }
                    />
                  </td>
                  <td>
                    (
                    {formatNumber(
                      cast.relevantHits.reduce(
                        (total, { amount, unmitigatedAmount }) =>
                          total + (unmitigatedAmount ?? amount),
                        0,
                      ),
                    )}{' '}
                    pre-mitigation damage taken)
                  </td>
                </tr>
                <tr>
                  <td>
                    Used <SpellLink id={SPELLS.PURIFYING_BREW.id} /> to Buff{' '}
                    <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />
                  </td>
                  <td>
                    <PassFailCheckmark
                      pass={
                        cast.stomps.filter((stomp) => stomp.purifies.length > 0).length >
                        MAX_STOMPS[cast.startEvent.ability.guid] / 2
                      }
                    />
                  </td>
                  <td>
                    ({cast.stomps.filter((stomp) => stomp.purifies.length > 0).length} Stomps
                    buffed)
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          <section>
            <header style={{ fontWeight: 'bold' }}>Details</header>
            <table className="hits-list">
              <tbody>
                <tr>
                  <td>
                    <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} /> casts
                  </td>
                  <td className="pass-fail-counts">
                    {cast.stomps.length} / {MAX_STOMPS[cast.startEvent.ability.guid]}
                  </td>
                  <td>
                    <PassFailBar
                      pass={cast.stomps.length}
                      total={MAX_STOMPS[cast.startEvent.ability.guid]}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    Possible <SpellLink id={SPELLS.PURIFYING_BREW.id} /> Casts
                  </td>
                  <td className="pass-fail-counts">
                    {formatNumber(cast.purifies.length)} /{' '}
                    {TARGET_PURIFIES[cast.startEvent.ability.guid]}
                  </td>
                  <td>
                    <PassFailBar
                      pass={cast.purifies.length}
                      total={TARGET_PURIFIES[cast.startEvent.ability.guid]}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    Total <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} /> damage
                  </td>
                  <td className="pass-fail-counts">{formatNumber(cast.stompDamage)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Amount Purified</td>
                  <td className="pass-fail-counts">{formatNumber(cast.purifyStompContribution)}</td>
                </tr>
                <tr>
                  <td>Amount Pre-Purified</td>
                  <td className="pass-fail-counts">
                    {formatNumber(
                      cast.prePurified.reduce((total, { amount }) => total + amount, 0),
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
        <InvokeNiuzaoSummaryChart cast={cast} info={info} events={events} />
      </div>
    </ControlledExpandable>
  );
}

export function InvokeNiuzaoSection({
  castEfficiency,
  events,
  info,
  module,
}: Pick<GuideProps<any>, 'events' | 'info'> & {
  castEfficiency: CastEfficiency;
  module: InvokeNiuzao;
}): JSX.Element {
  const efficiency = castEfficiency.getCastEfficiencyForSpellId(
    SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id,
  )!;

  const wooEfficiency = castEfficiency.getCastEfficiencyForSpellId(
    SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id,
  );

  return (
    <Section title="Invoke Niuzao, the Black Ox">
      <p>
        <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} /> is one of the most powerful damage
        cooldowns in the game&mdash;and one of the most dangerous. Using this ability, we can
        efficiently turn massive amounts of damage taken into massive amounts of damage dealt.
      </p>
      <p>
        The level 58 upgrade to this ability causes <SpellLink id={SPELLS.PURIFYING_BREW.id} /> to
        add 25% of the purified damage to the next <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />{' '}
        within 6 seconds. Niuzao casts <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} /> when he is
        summoned, and then every 5 seconds after that, for a total of 5
        <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />s per{' '}
        <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} />.
        {info.combatant.hasCovenant(COVENANTS.KYRIAN.id) && (
          <>
            {' '}
            A cast of <SpellLink id={SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id} /> will trigger 3{' '}
            <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />
            s&mdash;though this Niuzao has some issues hitting bosses with large models.
          </>
        )}{' '}
        Casting <SpellLink id={SPELLS.PURIFYING_BREW.id} /> prior to summoning Niuzao will
        contribute to the damage of the first <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />.
      </p>
      <p>
        Unlike most damage cooldowns, it is frequently correct to sacrifice a cast of{' '}
        <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} /> in order to get a better cast later.
        This is because <em>so much</em> of the damage of this cooldown is tied up in using{' '}
        <SpellLink id={SPELLS.PURIFYING_BREW.id} /> to convert damage taken into damage dealt that a
        single <em>great</em> cast can be worth more than multiple mediocre casts.
      </p>
      <table className="hits-list">
        <tbody>
          <tr>
            <td>
              <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} /> casts
            </td>

            <td className="pass-fail-counts">
              {efficiency.casts} / {efficiency.maxCasts}{' '}
            </td>
            <td>
              <PassFailBar pass={efficiency.casts} total={efficiency.maxCasts} />
            </td>
          </tr>
          {info.combatant.hasCovenant(COVENANTS.KYRIAN.id) && (
            <tr>
              <td>
                <SpellLink id={SPELLS.WEAPONS_OF_ORDER_CAST.id} /> casts
              </td>
              <td className="pass-fail-counts">
                {wooEfficiency?.casts} / {wooEfficiency?.maxCasts}{' '}
              </td>
              <td>
                <PassFailBar pass={wooEfficiency!.casts} total={wooEfficiency!.maxCasts} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <SubSection title="Casts">
        {module.casts.map((cast, ix) => (
          <InvokeNiuzaoChecklist key={ix} cast={cast} info={info} events={events} />
        ))}
      </SubSection>
    </Section>
  );
}
