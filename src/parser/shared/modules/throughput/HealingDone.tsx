import { formatThousands } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, DamageEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import FlushLineChart from 'parser/ui/FlushLineChart';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatisticBar from 'parser/ui/StatisticBar';
import AutoSizer from 'react-virtualized-auto-sizer';
import SourceLink from 'interface/report/SourceLink';

import HealingValue from '../HealingValue';

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

  bySecond: Record<number, HealingValue> = {};

  _byAbility: Record<number, HealingValue> = {};
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
            <img src="img/healing.png" alt="Healing" />
          </div>
          <div className="flex-sub value" style={{ width: 190 }}>
            {formatThousands(perSecond)} HPS
          </div>
          <div className="flex-main chart" style={{ padding: 0 }}>
            <SourceLink
              kind="healingDone"
              fightId={this.owner.fightId}
              playerId={this.owner.playerId}
            >
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
            </SourceLink>
          </div>
        </div>
      </StatisticBar>
    );
  }
}

export default HealingDone;
