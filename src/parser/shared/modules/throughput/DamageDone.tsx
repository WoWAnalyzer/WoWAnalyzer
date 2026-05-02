import fetchWcl from 'common/fetchWclApi';
import { formatThousands } from 'common/format';
import makeWclUrl from 'common/makeWclUrl';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import FlushLineChart from 'parser/ui/FlushLineChart';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatisticBar from 'parser/ui/StatisticBar';
import { WCLDamageDoneTableResponse, WclTable } from 'common/WCL_TYPES';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useEffect, useState } from 'react';

import DamageValue from '../DamageValue';
import Enemies from '../Enemies';

interface DamageDoneStatisticProps {
  chartData: Array<{ time: number; val: number }>;
  eventDps: number;
  eventTotalDamage: number;
  fightDuration: number;
  fightId: number;
  fightEnd: number;
  fightStart: number;
  playerId: number;
  reportCode: string;
}

interface WclDamageDoneStats {
  totalDamage: number;
  dps: number;
}

const DamageDoneStatistic = ({
  chartData,
  eventDps,
  eventTotalDamage,
  fightDuration,
  fightId,
  fightEnd,
  fightStart,
  playerId,
  reportCode,
}: DamageDoneStatisticProps) => {
  const [wclDamageDone, setWclDamageDone] = useState<WclDamageDoneStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const table = await fetchWcl<WCLDamageDoneTableResponse>(
          `report/tables/${WclTable.DamageDone}/${reportCode}`,
          {
            start: fightStart,
            end: fightEnd,
            actorid: playerId,
          },
        );

        const totalDamage = table.entries.reduce(
          (damageDone, entry) => damageDone + entry.total,
          0,
        );
        const totalTime = table.totalTime || fightDuration;
        const dps = totalTime > 0 ? (totalDamage / totalTime) * 1000 : 0;

        if (!cancelled) {
          setWclDamageDone({ totalDamage, dps });
        }
      } catch (error) {
        console.warn('Failed to load WCL damage-done table for the damage statistic:', error);
        if (!cancelled) {
          setWclDamageDone({ totalDamage: eventTotalDamage, dps: eventDps });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [eventDps, eventTotalDamage, fightDuration, fightEnd, fightStart, playerId, reportCode]);

  const displayedDps = wclDamageDone?.dps ?? eventDps;
  const isLoading = !wclDamageDone;

  return (
    <StatisticBar
      position={STATISTIC_ORDER.CORE(1)}
      ultrawide
      large={false}
      wide={false}
      style={{ marginBottom: 20, overflow: 'hidden' }}
    >
      <div className="flex">
        <div className="flex-sub icon">
          <img src="/img/sword.png" alt="Damage" />
        </div>
        <div className="flex-sub value" style={{ width: 190 }}>
          {isLoading ? 'Loading WCL DPS...' : `${formatThousands(displayedDps)} DPS`}
        </div>
        <div className="flex-main chart">
          <a
            href={makeWclUrl(reportCode, { fight: fightId, source: playerId, type: 'damage-done' })}
          >
            {displayedDps > 0 && (
              <AutoSizer disableWidth>
                {({ height }) => (
                  <FlushLineChart
                    data={chartData}
                    duration={fightDuration / 1000}
                    height={height}
                  />
                )}
              </AutoSizer>
            )}
          </a>
        </div>
      </div>
    </StatisticBar>
  );
};

class DamageDone extends Analyzer.withDependencies({ enemies: Enemies }) {
  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onByPlayerDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onByPlayerPetDamage);
  }

  _total = DamageValue.empty();
  private _totalBoss = DamageValue.empty();

  get total() {
    return this._total;
  }
  get totalBoss() {
    return this._totalBoss;
  }

  _byPet: Record<number, DamageValue> = {};
  byPet(petId: number) {
    if (!this._byPet[petId]) {
      return DamageValue.empty();
    }
    return this._byPet[petId];
  }
  get totalByPets() {
    return Object.keys(this._byPet)
      .map((petId) => this._byPet[parseInt(petId)])
      .reduce((total, damageValue) => total.add(damageValue), DamageValue.empty());
  }

  bySecond: Record<number, DamageValue> = {};

  onByPlayerDamage(event: DamageEvent) {
    if (!event.targetIsFriendly) {
      this._total = this._total.addEvent(event);

      if (this.deps.enemies.getById(event.targetID)?.subType === 'Boss') {
        this._totalBoss = this._totalBoss.addEvent(event);
      }

      const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
      if (!this.bySecond[secondsIntoFight]) {
        this.bySecond[secondsIntoFight] = DamageValue.empty();
      }
      this.bySecond[secondsIntoFight] = this.bySecond[secondsIntoFight].addEvent(event);
    }
  }
  onByPlayerPetDamage(event: DamageEvent) {
    if (!event.targetIsFriendly) {
      this._total = this._total.addEvent(event);

      if (this.deps.enemies.getById(event.targetID)?.subType === 'Boss') {
        this._totalBoss = this._totalBoss.addEvent(event);
      }

      const petId = event.sourceID;
      if (petId) {
        this._byPet[petId] = this.byPet(petId).addEvent(event);
      }
    }
  }

  showStatistic = true;
  subStatistic() {
    // rendered by ThroughputStatisticGroup
    if (!this.showStatistic) {
      return null;
    }

    const data = Object.entries(this.bySecond).map(([sec, val]) => ({
      time: Number(sec),
      val: val.effective,
    }));

    const perSecond = (this.total.effective / this.owner.fightDuration) * 1000;
    return (
      <DamageDoneStatistic
        chartData={data}
        eventDps={perSecond}
        eventTotalDamage={this.total.effective}
        fightDuration={this.owner.fightDuration}
        fightId={this.owner.fightId}
        fightEnd={this.owner.fight.end_time}
        fightStart={this.owner.fight.start_time}
        playerId={this.owner.playerId}
        reportCode={this.owner.report.code}
      />
    );
  }
}

export default DamageDone;
