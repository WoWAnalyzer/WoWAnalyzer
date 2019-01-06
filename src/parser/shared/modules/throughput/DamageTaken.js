import React from 'react';
import { XYPlot, AreaSeries } from 'react-vis';
import { AutoSizer } from 'react-virtualized';
import 'react-vis/dist/style.css';

import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import groupDataForChart from 'common/groupDataForChart';
import makeWclUrl from 'common/makeWclUrl';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import rankingColor from 'common/getRankingColor';
import StatisticBar from 'interface/statistics/StatisticBar';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Analyzer from 'parser/core/Analyzer';
import Tooltip from 'common/Tooltip';

import DamageValue from '../DamageValue';

class DamageTaken extends Analyzer {
  static IGNORED_ABILITIES = [
    SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id,
  ];

  _total = new DamageValue(); // consider this "protected", so don't change this from other modules. If you want special behavior you must add that code to an extended version of this module.
  get total() {
    return this._total;
  }

  bySecond = {};

  _byAbility = {};
  byAbility(spellId) {
    if (!this._byAbility[spellId]) {
      return new DamageValue();
    }
    return this._byAbility[spellId];
  }

  _byMagicSchool = {};
  byMagicSchool(magicSchool) {
    if (!this._byMagicSchool[magicSchool]) {
      return new DamageValue();
    }
    return this._byMagicSchool[magicSchool];
  }

  on_toPlayer_damage(event) {
    this._addDamage(event, event.amount, event.absorbed, event.blocked, event.overkill);
  }

  _addDamage(event, amount = 0, absorbed = 0, blocked = 0, overkill = 0, ability = event.ability) {
    const spellId = ability.guid;
    if (this.constructor.IGNORED_ABILITIES.includes(spellId)) {
      // Some player abilities (mostly of healers) cause damage as a side-effect, these shouldn't be included in the damage taken.
      return;
    }
    this._total = this._total.add(amount, absorbed, blocked, overkill);

    if (this._byAbility[spellId]) {
      this._byAbility[spellId] = this._byAbility[spellId].add(amount, absorbed, blocked, overkill);
    } else {
      this._byAbility[spellId] = new DamageValue(amount, absorbed, blocked, overkill);
    }

    const magicSchool = event.ability.type;
    if (this._byMagicSchool[magicSchool]) {
      this._byMagicSchool[magicSchool] = this._byMagicSchool[magicSchool].add(amount, absorbed, blocked, overkill);
    } else {
      this._byMagicSchool[magicSchool] = new DamageValue(amount, absorbed, blocked, overkill);
    }

    const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
    this.bySecond[secondsIntoFight] = (this.bySecond[secondsIntoFight] || new DamageValue()).add(amount, absorbed, blocked, overkill);
  }
  _subtractDamage(event, amount = 0, absorbed = 0, blocked = 0, overkill = 0) {
    return this._addDamage(event, -amount, -absorbed, -blocked, -overkill);
  }

  get tooltip() {
    const physical = (this._byMagicSchool[MAGIC_SCHOOLS.ids.PHYSICAL]) ? this._byMagicSchool[MAGIC_SCHOOLS.ids.PHYSICAL].effective : 0;
    const magical = this.total.effective - physical;
    return (
      <>
        <strong>Damage taken by type:</strong>
        <ul>
          <li><strong>Physical</strong>: {formatThousands(physical)} ({formatPercentage(physical / this.total.effective)}%)</li>
          <li><strong>Magic</strong>: {formatThousands(magical)} ({formatPercentage(magical / this.total.effective)}%)</li>
        </ul><br />

        <strong>Damage taken by magic school:</strong>
        <ul>
          {Object.keys(this._byMagicSchool)
            .filter(type => this._byMagicSchool[type].effective !== 0)
            .map(type => (
              <li key={type}>
                <strong>{MAGIC_SCHOOLS.names[type] || 'Unknown'}</strong>: {formatThousands(this._byMagicSchool[type].effective)} ({formatPercentage(this._byMagicSchool[type].effective / this.total.effective)}%)
              </li>
            ))
          }
        </ul>
      </>
    );
  }

  showStatistic = true;
  subStatistic() { // rendered by ThroughputStatisticGroup
    if (!this.showStatistic) {
      return null;
    }

    const groupedData = groupDataForChart(this.bySecond, this.owner.fightDuration);
    const perSecond = this.total.effective / this.owner.fightDuration * 1000;
    const wclUrl = makeWclUrl(this.owner.report.code, {
      fight: this.owner.fightId,
      source: this.owner.playerId,
      type: 'damage-taken',
    });

    return (
      <StatisticBar
        position={STATISTIC_ORDER.CORE(3)}
        ultrawide
        style={{ marginBottom: 0, overflow: 'hidden' }} // since this is in a group, reducing margin should be fine
      >
        <div className="flex">
          <div className="flex-sub icon">
            <img
              src="/img/shield.png"
              alt="Damage taken"
            />
          </div>
          <Tooltip
            className="flex-sub value"
            wrapperStyles={{ width: 190 }}
            content={this.tooltip}
            tagName="div"
          >
            {formatThousands(perSecond)} DTPS
          </Tooltip>
          <div className={`flex-sub ${rankingColor(0)}`} style={{ width: 110, textAlign: 'center' }}>
            -
          </div>
          <div className="flex-main chart">
            <a href={wclUrl}>
              {perSecond > 0 && (
                <AutoSizer>
                  {({ width, height }) => (
                    <XYPlot
                      margin={0}
                      width={width}
                      height={height}
                    >
                      <AreaSeries
                        data={Object.keys(groupedData).map(x => ({
                          x: x / width,
                          y: groupedData[x],
                        }))}
                        className="primary"
                      />
                    </XYPlot>
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

export default DamageTaken;
