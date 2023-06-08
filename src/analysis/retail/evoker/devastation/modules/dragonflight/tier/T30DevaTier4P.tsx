import SPELLS from 'common/SPELLS';
import { qualitativePerformanceToColor } from 'interface/guide';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { Item } from 'parser/ui/DonutChart';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { TALENTS_EVOKER } from 'common/TALENTS';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { SpellLink } from 'interface';

const { BLAZING_SHARDS, OBSIDIAN_SHARDS } = SPELLS;

const { DRAGONRAGE_TALENT } = TALENTS_EVOKER;

export type BlazeShardCounters = {
  castTimeStamp: number;
};

class T30DevaTier4P extends Analyzer {
  inDragonRageWindow: boolean = false;
  totalLostUptime: number = 0;
  totalCasts: number = 0;
  obsidianShardsDam: number = 0;
  obsidianShardsDamDuringBlazing: number = 0;
  blazhingShardsActive: boolean = false;

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

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(OBSIDIAN_SHARDS), (event) => {
      this.obsidianShardsDam += event.amount;
      if (this.blazhingShardsActive || this.inDragonRageWindow) {
        this.obsidianShardsDamDuringBlazing += event.amount;
      }
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
      this.blazhingShardsActive = true;
      this.totalCasts += 1;
      this.blazeShardCounters[this.totalCasts] = {
        castTimeStamp: event.timestamp,
      };
      this.performanceCheck();
    });

    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(BLAZING_SHARDS), (event) => {
      this.blazhingShardsActive = false;
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
        valueTooltip: perfect + ' empower casts',
        color: qualitativePerformanceToColor(QualitativePerformance.Perfect),
      },
      {
        label: 'Buff staggered correctly',
        value: good,
        valueTooltip: good + ' empower casts',
        color: qualitativePerformanceToColor(QualitativePerformance.Good),
      },
      {
        label: 'Buff overriden with <0.5s left',
        value: ok,
        valueTooltip: ok + ' empower casts',
        color: qualitativePerformanceToColor(QualitativePerformance.Ok),
      },
      {
        label: 'Buff overriden with >0.5s left',
        value: fail,
        valueTooltip: fail + ' empower casts',
        color: qualitativePerformanceToColor(QualitativePerformance.Fail),
      },
    ];
  }
  get lostUptime() {
    return this.totalLostUptime;
  }

  statistic() {
    const damageFrom4Set =
      this.obsidianShardsDamDuringBlazing - this.obsidianShardsDamDuringBlazing / 3;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <ul>
              <li>
                Wasted <SpellLink id={BLAZING_SHARDS} /> uptime: {this.totalLostUptime.toFixed(2)}s.
              </li>
            </ul>
          </>
        }
      >
        <BoringValueText label="Obsidian Secrets (T30 Set Bonus)">
          <h4>2 Piece</h4>
          <ItemDamageDone amount={this.obsidianShardsDam - damageFrom4Set} />
          <h4>4 Piece</h4>
          <ItemDamageDone amount={damageFrom4Set} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default T30DevaTier4P;
