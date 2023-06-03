import SPELLS from 'common/SPELLS';
import { qualitativePerformanceToColor } from 'interface/guide';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { Item } from 'parser/ui/DonutChart';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { TALENTS_EVOKER } from 'common/TALENTS';

const { BLAZING_SHARDS } = SPELLS;

const { DRAGONRAGE_TALENT } = TALENTS_EVOKER;

export type BlazeShardCounters = {
  castTimeStamp: number;
};

class T30DevaTier4P extends Analyzer {
  inDragonRageWindow: boolean = false;
  totalLostUptime: number = 0;
  totalCasts: number = 0;
  blazeShardCounters: {
    [window: number]: BlazeShardCounters;
  } = {
    0: {
      castTimeStamp: 0,
    },
  };

  windowEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT), () => {
      this.inDragonRageWindow = true;
    });

    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT), () => {
      this.inDragonRageWindow = false;
    });

    // When blazing shard is applied track timestamp and increment counter
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(BLAZING_SHARDS), (event) => {
      this.totalCasts += 1;
      this.blazeShardCounters[this.totalCasts] = {
        castTimeStamp: event.timestamp,
      };
      this.performanceCheck();
    });

    // When blazing shard is refreshed track timestamp and increment counter
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(BLAZING_SHARDS), (event) => {
      this.totalCasts += 1;
      this.blazeShardCounters[this.totalCasts] = {
        castTimeStamp: event.timestamp,
      };
      this.performanceCheck();
    });
  }

  performanceCheck() {
    const blazingShardsBuffDuration = 5;
    // Calculate the difference between applications of blazing shard to figure out if they overlap
    const blazeStagger =
      (this.blazeShardCounters[this.totalCasts].castTimeStamp -
        this.blazeShardCounters[this.totalCasts - 1].castTimeStamp) /
      1000;
    // Calculate the lost uptime
    const blazeShardLoss = blazingShardsBuffDuration - blazeStagger;

    // Keep track of total lost uptime. Ignore dragonrage windows
    if (blazeShardLoss > 0 && !this.inDragonRageWindow) {
      this.totalLostUptime += blazeShardLoss;
    }

    let performance = QualitativePerformance.Fail;
    if (this.inDragonRageWindow) {
      performance = QualitativePerformance.Perfect;
    } else if (blazeShardLoss < 0) {
      performance = QualitativePerformance.Good;
    } else if (blazeShardLoss <= 0.5) {
      performance = QualitativePerformance.Ok;
    }
    this.windowEntries.push({
      value: performance,
      tooltip: (
        <div>
          {this.inDragonRageWindow && (
            <div>
              <strong>Dragonrage Active</strong>
            </div>
          )}
          {performance === QualitativePerformance.Good && (
            <div>
              <strong>Buff wasn't overridden</strong>
            </div>
          )}
          {performance === QualitativePerformance.Ok && (
            <div>
              <strong>Buff overridden early</strong>
              <div>Buff remaining: {blazeShardLoss.toFixed(2)}s</div>
            </div>
          )}
          {performance === QualitativePerformance.Fail && (
            <div>
              <strong>Buff overridden too early</strong>
              <div>Buff remaining: {blazeShardLoss.toFixed(2)}s</div>
            </div>
          )}
        </div>
      ),
    });
  }

  get donutItems(): Item[] {
    const perfect = this.windowEntries.filter(
      (entry) => entry.value === QualitativePerformance.Perfect,
    ).length;
    const good = this.windowEntries.filter(
      (entry) => entry.value === QualitativePerformance.Good,
    ).length;
    const ok = this.windowEntries.filter(
      (entry) => entry.value === QualitativePerformance.Ok,
    ).length;
    const fail = this.windowEntries.filter(
      (entry) => entry.value === QualitativePerformance.Fail,
    ).length;

    return [
      {
        label: 'Dragonrage Active',
        value: perfect,
        color: qualitativePerformanceToColor(QualitativePerformance.Perfect),
      },
      {
        label: 'Blazing Shards not overriden',
        value: good,
        color: qualitativePerformanceToColor(QualitativePerformance.Good),
      },
      {
        label: 'Blazing Shards overriden early',
        value: ok,
        color: qualitativePerformanceToColor(QualitativePerformance.Ok),
      },
      {
        label: 'Blazing Shards overriden too early',
        value: fail,
        color: qualitativePerformanceToColor(QualitativePerformance.Fail),
      },
    ];
  }
  get lostUptime() {
    return this.totalLostUptime;
  }
}

export default T30DevaTier4P;
