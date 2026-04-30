import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import { Panel } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  DeathEvent,
  EventType,
  HasHitpoints,
  HealEvent,
  HitpointsEvent,
} from 'parser/core/Events';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import StaggerPool from '../core/StaggerPool';
import PurifyingBrew from '../talents/PurifyingBrew';
import HighTolerance from '../spells/HighTolerance';
import { OkColor } from 'interface/guide';

interface StaggerEvent {
  timestamp: number;
  newPooledDamage: number;
}

/**
 * A graph of staggered damage (and related quantities) over time.
 *
 * The idea of this is to help people identify the root cause of:
 *   - overly high dtps (purifying well after a peak instead of at the peak)
 *   - death (stagger ticking too high? one-shot? health trickling away without heals?)
 *
 * As well as just giving a generally interesting look into when damage
 * actually hit your health bar on a fight.
 */
class StaggerPoolGraph extends Analyzer.withDependencies({
  stagger: StaggerPool,
  pb: PurifyingBrew,
  ht: HighTolerance,
}) {
  _hpEvents: HitpointsEvent<EventType>[] = [];
  _deathEvents: DeathEvent[] = [];
  _lastHp: number | null = null;
  _lastMaxHp: number | null = null;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._damage);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this._heal);
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this._death);
  }

  get plot() {
    const xAxis = {
      field: 'timestamp_shifted',
      type: 'quantitative' as const,
      axis: {
        labelExpr: formatTime('datum.value'),
        tickCount: 25,
        grid: false,
      },
      scale: {
        nice: false,
      },
      title: null,
    };

    const startTime = this.owner.fight.start_time - this.owner.fight.offset_time;

    const spec: VisualizationSpec = {
      data: {
        name: 'combined',
      },
      transform: [
        {
          filter: 'isValid(datum.newPooledDamage)',
        },
        {
          calculate: `datum.timestamp - ${startTime}`,
          as: 'timestamp_shifted',
        },
      ],
      encoding: {
        x: xAxis,
        tooltip: [
          {
            field: 'newPooledDamage',
            type: 'quantitative' as const,
            title: 'Staggered Damage',
            format: '.3~s',
          },
        ],
      },
      layer: [
        {
          data: {
            name: 'hp',
          },
          mark: {
            type: 'area',
            color: 'rgb(38, 62, 41)',
            interpolate: 'step',
          },
          transform: [
            {
              calculate: `datum.timestamp - ${startTime}`,
              as: 'timestamp_shifted',
            },
          ],
          encoding: {
            x: xAxis,
            y: {
              field: 'hitPoints',
              type: 'quantitative' as const,
              title: null,
            },
            tooltip: [
              {
                field: 'hitPoints',
                type: 'quantitative' as const,
                title: 'Hit Points',
                format: '.3~s',
              },
            ],
          },
        },
        {
          mark: {
            type: 'line' as const,
            strokeWidth: 1,
            interpolate: 'step',
            color: 'rgba(250, 183, 0)',
          },
          encoding: {
            y: {
              field: 'newPooledDamage',
              type: 'quantitative' as const,
              title: null,
              axis: {
                grid: false,
                format: '~s',
              },
            },
          },
        },
        {
          data: {
            name: 'purifies',
          },
          mark: {
            type: 'point' as const,
            filled: true,
            size: 60,
            opacity: 1,
            strokeWidth: 1,
          },
          transform: [
            {
              calculate: `datum.timestamp - ${startTime}`,
              as: 'timestamp_shifted',
            },
          ],
          encoding: {
            x: xAxis,
            y: {
              field: 'oldPooledAmount',
              type: 'quantitative' as const,
              title: null,
            },
            color: {
              condition: {
                test: 'datum["isElevated"] || datum["isElevated"] == null',
                value: '#00ff96',
              },
              value: OkColor,
            },
            stroke: {
              condition: {
                test: 'datum["isElevated"] || datum["isElevated"] == null',
                value: undefined,
              },
              value: 'black',
            },
            tooltip: [
              { field: 'amount', title: 'Amount Purified', format: '.3~s' },
              {
                field: 'oldPooledAmount',
                type: 'quantitative' as const,
                title: 'Staggered Damage',
                format: '.3~s',
              },
            ],
          },
        },
        {
          data: {
            name: 'deaths',
          },
          mark: {
            type: 'rule' as const,
            color: 'red',
          },
          transform: [
            {
              calculate: `datum.timestamp - ${startTime}`,
              as: 'timestamp_shifted',
            },
          ],
          encoding: {
            x: xAxis,
          },
        },
      ],
    };

    if (this.deps.stagger.pool.data.length > 0) {
      const staggerEvents = this.deps.stagger.pool.data.map(
        (point) =>
          ({
            timestamp: point.timestamp,
            newPooledDamage: point.total,
          }) satisfies StaggerEvent,
      );

      const hpEvents = this._hpEvents.map(({ timestamp, hitPoints }) => {
        return {
          timestamp: timestamp,
          hitPoints: hitPoints,
        };
      });

      const hasHT = this.selectedCombatant.hasTalent(talents.HIGH_TOLERANCE_TALENT);
      const purifyEvents = !hasHT
        ? this.deps.pb.purifies
        : this.deps.pb.purifies.map((point) => {
            // check if the buff was active when this cast occurred (strict before to deal with removals that occur exactly when you cast)
            const previousBuffEvent = this.deps.ht.uptime.getBefore(point.timestamp, true);
            const isElevated = previousBuffEvent?.type === EventType.ApplyBuff;
            return {
              ...point,
              isElevated,
            };
          });

      return (
        <div
          className="graph-container"
          style={{
            width: '100%',
            minHeight: 200,
          }}
        >
          <AutoSizer>
            {({ width, height }) => (
              <BaseChart
                spec={spec}
                data={{
                  combined: staggerEvents,
                  purifies: purifyEvents,
                  deaths: this._deathEvents,
                  hp: hpEvents,
                }}
                width={width}
                height={height}
              />
            )}
          </AutoSizer>
        </div>
      );
    } else {
      return null;
    }
  }

  _damage(event: DamageEvent) {
    if (!HasHitpoints(event)) {
      return;
    }
    this._hpEvents.push(event);
  }

  _heal(event: HealEvent) {
    if (!HasHitpoints(event)) {
      return;
    }
    this._hpEvents.push(event);
  }

  _death(event: DeathEvent) {
    this._deathEvents.push(event);
  }

  tab() {
    return {
      title: 'Stagger',
      url: 'stagger',
      render: () => (
        <Panel
          title="Stagger"
          explanation={
            <>
              Damage you take is placed into a <em>pool</em> by <SpellLink spell={SPELLS.STAGGER} />
              . This damage is then removed by the damage-over-time component of{' '}
              <SpellLink spell={SPELLS.STAGGER} /> or by{' '}
              <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> (or other sources of
              purification). This plot shows the amount of damage pooled over the course of the
              fight.
            </>
          }
        >
          {this.plot}
        </Panel>
      ),
    };
  }
}

export default StaggerPoolGraph;
