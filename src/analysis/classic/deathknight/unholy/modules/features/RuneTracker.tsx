import { JSX } from 'react';
import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import MoPRuneTracker from 'analysis/classic/deathknight/shared/MoPRuneTracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { VisualizationSpec } from 'react-vega';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import RunicPowerTracker from './RunicPowerTracker';

/**
 * Unholy DK rune tracker.
 * Festering Strike converts the spent Blood and Frost runes to Death runes.
 */
class UnholyRuneTracker extends MoPRuneTracker {
  static override dependencies = {
    ...MoPRuneTracker.dependencies,
    rpTracker: RunicPowerTracker,
  };

  protected rpTracker!: RunicPowerTracker;

  protected static override bloodIsDeath = false;
  protected static override convertOnFesteringStrike = true;

  /** Death Coil is the primary RP spender for Unholy DK — show as half-height bar. */
  protected static override rpSpendersToTrack = [SPELLS.DEATH_COIL_DK.id];

  private _runeSpec(
    dataName: string,
    title: string,
    naturalColor: string,
    width: number,
  ): VisualizationSpec {
    const fightStart = this.owner.fight.start_time;
    const xEnc = {
      field: 'ts',
      type: 'quantitative' as const,
      axis: { labelExpr: formatTime('datum.value'), tickCount: 25, grid: false },
      scale: { nice: false },
      title: null,
    };
    return {
      data: { name: dataName },
      width,
      height: 100,
      transform: [
        { filter: 'isValid(datum.timestamp)' },
        { calculate: `datum.timestamp - ${fightStart}`, as: 'ts' },
        { calculate: formatTime('datum.ts'), as: 'ts_label' },
        { calculate: 'datum.natural + datum.death', as: 'total' },
      ],
      encoding: { x: xEnc },
      layer: [
        {
          mark: {
            type: 'area' as const,
            interpolate: 'step-after' as const,
            color: 'rgb(148,80,210)',
            opacity: 0.75,
          },
          encoding: {
            y: {
              field: 'total',
              title,
              type: 'quantitative' as const,
              scale: { domain: [0, 2] },
              axis: { grid: true, values: [0, 1, 2], tickMinStep: 1 },
            },
            y2: { field: 'natural' },
          },
        },
        {
          mark: {
            type: 'area' as const,
            interpolate: 'step-after' as const,
            color: naturalColor,
            opacity: 0.9,
          },
          encoding: {
            y: { field: 'natural', type: 'quantitative' as const, scale: { domain: [0, 2] } },
          },
        },
        {
          mark: { type: 'rule' as const, color: 'white' },
          encoding: {
            opacity: { condition: { value: 0.3, param: 'hover', empty: false }, value: 0 },
            tooltip: [
              { field: 'ts_label', type: 'nominal' as const, title: 'Time' },
              { field: 'natural', type: 'quantitative' as const, title: 'Natural' },
              { field: 'death', type: 'quantitative' as const, title: 'Death' },
            ],
          },
          params: [
            {
              name: 'hover',
              select: {
                type: 'point' as const,
                fields: ['ts'],
                nearest: true,
                on: 'mouseover',
                clear: 'mouseout',
              },
            },
          ],
        },
      ],
    } as VisualizationSpec;
  }

  private _castSpec(width: number): VisualizationSpec {
    const fightStart = this.owner.fight.start_time;
    const xEnc = {
      field: 'ts',
      type: 'quantitative' as const,
      axis: { labelExpr: formatTime('datum.value'), tickCount: 25, grid: false },
      scale: { nice: false },
      title: null,
    };
    return {
      data: { name: 'casts' },
      width,
      height: 80,
      transform: [
        { filter: 'isValid(datum.timestamp)' },
        { calculate: `datum.timestamp - ${fightStart}`, as: 'ts' },
        { calculate: formatTime('datum.ts'), as: 'ts_label' },
      ],
      mark: { type: 'tick' as const, thickness: 2 },
      encoding: {
        x: xEnc,
        size: {
          condition: { test: 'datum.halfHeight', value: 22 },
          value: 44,
        },
        color: {
          field: 'slot',
          type: 'nominal' as const,
          scale: {
            domain: ['Blood', 'Frost', 'Unholy', 'Mixed', 'Obliterate', 'RPSpend'],
            range: [
              'rgb(196,31,59)',
              'rgb(105,204,240)',
              'rgb(171,212,115)',
              'rgb(148,80,210)',
              'rgb(0,200,0)',
              'rgb(255,200,50)',
            ],
          },
          legend: null,
        },
        tooltip: [
          { field: 'ts_label', type: 'nominal' as const, title: 'Time' },
          { field: 'ability', type: 'nominal' as const, title: 'Ability' },
          { field: 'slot', type: 'nominal' as const, title: 'Type' },
        ],
      },
    } as VisualizationSpec;
  }

  get plot(): JSX.Element {
    const fightMs = this.owner.fight.end_time - this.owner.fight.start_time;
    const chartWidth = Math.max(800, Math.round((fightMs / 1000) * 12));
    return (
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <BaseChart
          spec={this._runeSpec('bloodData', 'Blood', 'rgb(196,31,59)', chartWidth)}
          data={{ bloodData: this.bloodHistory }}
          width={chartWidth}
          height={100}
        />
        <BaseChart
          spec={this._runeSpec('frostData', 'Frost', 'rgb(105,204,240)', chartWidth)}
          data={{ frostData: this.frostHistory }}
          width={chartWidth}
          height={100}
        />
        <BaseChart
          spec={this._runeSpec('unholyData', 'Unholy', 'rgb(171,212,115)', chartWidth)}
          data={{ unholyData: this.unholyHistory }}
          width={chartWidth}
          height={100}
        />
        <BaseChart
          spec={this.rpTracker.rpVegaSpec(chartWidth)}
          data={{ rpData: this.rpTracker.rpHistory }}
          width={chartWidth}
          height={100}
        />
        <BaseChart
          spec={this._castSpec(chartWidth)}
          data={{ casts: this.castHistory }}
          width={chartWidth}
          height={80}
        />
      </div>
    );
  }

  private _runeCountTable(title: string, sums: number[], fractions: number[]): JSX.Element {
    const capIndex = sums.length - 1;
    return (
      <div style={{ marginBottom: 8 }}>
        <strong>{title}</strong>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Runes available</th>
              <th>Time</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {sums.map((ms, count) => (
              <tr key={count} style={count === capIndex ? { color: 'red' } : undefined}>
                <th>
                  {count}
                  {count === capIndex ? ' (capped)' : ''}
                </th>
                <td>{formatDuration(ms)}</td>
                <td>{formatPercentage(fractions[count])}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
        tooltip={
          <>
            {this._runeCountTable('Blood', this.bloodReadySum, this.timeSpentAtBloodCount)}
            {this._runeCountTable('Frost', this.frostReadySum, this.timeSpentAtFrostCount)}
            {this._runeCountTable('Unholy', this.unholyReadySum, this.timeSpentAtUnholyCount)}
          </>
        }
      >
        <div className="pad">
          <label>Rune Tracker</label>
          <div className="value">
            {formatPercentage(this.runeCapPercent)}% <small>time at rune cap</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default UnholyRuneTracker;
