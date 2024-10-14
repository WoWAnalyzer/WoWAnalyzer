import { formatThousands, formatPercentage } from 'common/format';
import rankingColor from 'common/getRankingColor';
import makeWclUrl from 'common/makeWclUrl';
import { Tooltip } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, DamageEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import FlushLineChart from 'parser/ui/FlushLineChart';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatisticBar from 'parser/ui/StatisticBar';
import ThroughputPerformance, { UNAVAILABLE } from 'parser/ui/ThroughputPerformance';
import AutoSizer from 'react-virtualized-auto-sizer';

import HealingValue from '../HealingValue';
import { i18n } from '@lingui/core';

class HealingDone extends Analyzer {
  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER | SELECTED_PLAYER_PET), this.onHeal);
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER | SELECTED_PLAYER_PET),
      this.onAbsorbed,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER | SELECTED_PLAYER_PET),
      this.onRemovebuff,
    );
  }

  _total = HealingValue.empty();
  get total() {
    return this._total;
  }
  _healingByAbsorbs = HealingValue.empty();
  get healingByAbsorbs() {
    return this._healingByAbsorbs;
  }

  bySecond: { [secondsIntoFight: number]: HealingValue } = {};

  _byAbility: { [spellId: number]: HealingValue } = {};
  byAbility(spellId: number) {
    if (!this._byAbility[spellId]) {
      return HealingValue.empty();
    }
    return this._byAbility[spellId];
  }

  onHeal(event: HealEvent) {
    this._addHealing(event, event.amount, event.absorbed, event.overheal);
  }
  onAbsorbed(event: AbsorbedEvent) {
    this._addHealingByAbsorb(event, event.amount, 0, 0);
  }
  onRemovebuff(event: RemoveBuffEvent) {
    if (event.absorb) {
      this._addHealingByAbsorb(event, 0, 0, event.absorb);
    }
  }

  _addHealing(
    event: HealEvent | AbsorbedEvent | RemoveBuffEvent | DamageEvent,
    amount = 0,
    absorbed = 0,
    overheal = 0,
  ) {
    const healVal: HealingValue = HealingValue.fromValues({
      regular: amount,
      absorbed,
      overheal,
    });
    this._total = this._total.add(healVal);

    const spellId = event.ability.guid;
    if (!this._byAbility[spellId]) {
      this._byAbility[spellId] = HealingValue.empty();
    }
    this._byAbility[spellId] = this._byAbility[spellId].add(healVal);

    const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
    if (!this.bySecond[secondsIntoFight]) {
      this.bySecond[secondsIntoFight] = HealingValue.empty();
    }
    this.bySecond[secondsIntoFight] = this.bySecond[secondsIntoFight].add(healVal);
  }
  _addHealingByAbsorb(
    event: AbsorbedEvent | RemoveBuffEvent,
    amount = 0,
    absorbed = 0,
    overheal = 0,
  ) {
    this._addHealing(event, amount, absorbed, overheal);
    this._healingByAbsorbs = this._healingByAbsorbs.addValues({
      regular: amount,
      absorbed,
      overheal,
    });
  }
  _subtractHealing(event: DamageEvent, amount = 0, absorbed = 0, overheal = 0) {
    return this._addHealing(event, -amount, -absorbed, -overheal);
  }
  _subtractHealingByAbsorb(event: AbsorbedEvent, amount = 0, absorbed = 0, overheal = 0) {
    return this._addHealingByAbsorb(event, -amount, -absorbed, -overheal);
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
      type: 'healing',
    });

    return (
      <StatisticBar
        position={STATISTIC_ORDER.CORE(2)}
        ultrawide
        large={false}
        wide={false}
        style={{ marginBottom: 19, overflow: 'hidden' }} // since this is in a group, reducing margin should be fine
      >
        <div className="flex">
          <div className="flex-sub icon">
            <img src="/img/healing.png" alt="Healing" />
          </div>
          <Tooltip
            content={
              <>
                Total healing done: <strong>{formatThousands(this.total.effective)}</strong>
              </>
            }
          >
            <div className="flex-sub value" style={{ width: 190 }}>
              {formatThousands(perSecond)} HPS
            </div>
          </Tooltip>
          <div
            className="flex-sub"
            style={{ width: 110, textAlign: 'center', padding: '10px 5px' }}
          >
            <ThroughputPerformance throughput={perSecond} metric="hps">
              {({ performance, topThroughput }) =>
                performance &&
                performance !== UNAVAILABLE && (
                  <Tooltip
                    content={
                      <>
                        Your HPS compared to the HPS of a top 100 player. To become a top 100{' '}
                        <span className={this.selectedCombatant.player.type.replace(' ', '')}>
                          {this.selectedCombatant.spec?.specName
                            ? i18n._(this.selectedCombatant.spec.specName)
                            : null}{' '}
                          {this.selectedCombatant.player.type}
                        </span>{' '}
                        on this fight you need to do at least{' '}
                        <strong>{formatThousands(topThroughput || 0)} HPS</strong>.
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
          <div className="flex-main chart" style={{ padding: 0 }}>
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

export default HealingDone;
