import { formatThousands, formatPercentage, formatDuration } from 'common/format';
import rankingColor from 'common/getRankingColor';
import makeWclUrl from 'common/makeWclUrl';
import { Tooltip } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import FlushLineChart from 'parser/ui/FlushLineChart';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatisticBar from 'parser/ui/StatisticBar';
import ThroughputPerformance, { UNAVAILABLE } from 'parser/ui/ThroughputPerformance';
import AutoSizer from 'react-virtualized-auto-sizer';

import DamageValue from '../DamageValue';
import { i18n } from '@lingui/core';

class DamageDone extends Analyzer {
  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onByPlayerDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onByPlayerPetDamage);
  }

  _total = new DamageValue();
  get total() {
    return this._total;
  }
  _byPet: { [petId: number]: DamageValue } = {};
  byPet(petId: number) {
    if (!this._byPet[petId]) {
      return new DamageValue();
    }
    return this._byPet[petId];
  }
  get totalByPets() {
    return Object.keys(this._byPet)
      .map((petId) => this._byPet[parseInt(petId)])
      .reduce(
        (total, damageValue) =>
          total.add(
            damageValue.regular,
            damageValue.absorbed,
            damageValue.blocked,
            damageValue.overkill,
          ),
        new DamageValue(),
      );
  }

  bySecond: { [secondsIntoFight: number]: DamageValue } = {};

  onByPlayerDamage(event: DamageEvent) {
    if (!event.targetIsFriendly) {
      this._total = this._total.add(event.amount, event.absorbed, event.blocked, event.overkill);

      const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
      this.bySecond[secondsIntoFight] = (this.bySecond[secondsIntoFight] || new DamageValue()).add(
        event.amount,
        event.absorbed,
        event.blocked,
        event.overkill,
      );
    }
  }
  onByPlayerPetDamage(event: DamageEvent) {
    if (!event.targetIsFriendly) {
      this._total = this._total.add(event.amount, event.absorbed, event.blocked, event.overkill);
      const petId = event.sourceID;
      if (petId) {
        this._byPet[petId] = this.byPet(petId).add(
          event.amount,
          event.absorbed,
          event.blocked,
          event.overkill,
        );
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
      time: sec,
      val: val.effective,
    }));

    const perSecond = (this.total.effective / this.owner.fightDuration) * 1000;
    const wclUrl = makeWclUrl(this.owner.report.code, {
      fight: this.owner.fightId,
      source: this.owner.playerId,
      type: 'damage-done',
    });

    return (
      <StatisticBar
        position={STATISTIC_ORDER.CORE(1)}
        ultrawide
        large={false}
        wide={false}
        style={{ marginBottom: 20, overflow: 'hidden' }} // since this is in a group, reducing margin should be fine
      >
        <div className="flex">
          <div className="flex-sub icon">
            <img src="/img/sword.png" alt="Damage" />
          </div>
          <Tooltip
            content={
              <>
                Total damage done: <strong>{formatThousands(this.total.effective)}</strong>
              </>
            }
          >
            <div className="flex-sub value" style={{ width: 190 }}>
              {formatThousands(perSecond)} DPS
            </div>
          </Tooltip>
          <div
            className="flex-sub"
            style={{ width: 110, textAlign: 'center', padding: '10px 5px' }}
          >
            <ThroughputPerformance throughput={perSecond} metric="dps">
              {({ performance, topThroughput, medianDuration }) =>
                performance &&
                performance !== UNAVAILABLE &&
                medianDuration && (
                  <Tooltip
                    content={
                      <>
                        Your DPS compared to the DPS of a top 100 player. To become a top 100{' '}
                        <span className={this.selectedCombatant.player.type.replace(' ', '')}>
                          {this.selectedCombatant.spec?.specName
                            ? i18n._(this.selectedCombatant.spec.specName)
                            : null}{' '}
                          {this.selectedCombatant.player.type}
                        </span>{' '}
                        on this fight you need to do at least{' '}
                        <strong>{formatThousands(topThroughput || 0)} DPS</strong>.<br />
                        <br />
                        Your fight lasted {formatDuration(this.owner.fightDuration)}. The median
                        duration of the fights in the top 100 was {formatDuration(medianDuration)}.
                      </>
                    }
                  >
                    <div className={rankingColor(performance)} style={{ cursor: 'help' }}>
                      {performance >= 1 ? 'TOP 100' : `${formatPercentage(performance, 0)}%`}
                    </div>
                  </Tooltip>
                )
              }
            </ThroughputPerformance>
          </div>
          <div className="flex-main chart">
            <a href={wclUrl}>
              {perSecond > 0 && (
                <AutoSizer disableWidth>
                  {({ height }) => (
                    <FlushLineChart
                      data={data}
                      duration={this.owner.fightDuration / 1000}
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
  }
}

export default DamageDone;
