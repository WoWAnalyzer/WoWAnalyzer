import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import Tab from 'Main/Tab';
import SPELLS from 'common/SPELLS';
import SCHOOLS from 'common/MAGIC_SCHOOLS';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatNumber, formatPercentage } from 'common/format';

class StaggerTable extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    stats: StatTracker,
  };

  _isUsingHT = false;
  _staggerEvent = null;
  _staggerData = [];

  get tableData() {
    return this._staggerData;
  }

  on_toPlayer_damage(event) {
    if(event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    if(!this._staggerEvent && event.amount + event.absorbed === 0) {
      return; // no stagger absorb because we dodged (or the hit did 0 damage for any other reason)
    } 
    if(!this._staggerEvent) {
      // actual bug
      console.error("Damage event occurred without any associated stagger absorb", event);
      return;
    }
    if(event.timestamp !== this._staggerEvent.timestamp) {
      this._staggerEvent = null; // we've passed the point where the staggered damage occurred, so clear it and move on
      return;
    }
    this._pushStaggerDatum(event);
  }

  on_addstagger(event) {
    this._staggerEvent = event;
  }

  _pushStaggerDatum(dmgEvent) {
    const absorbEvent = this._staggerEvent;
    this._staggerEvent = null;
    this._staggerData.push({
      timestamp: absorbEvent.timestamp,
      amount: absorbEvent.amount,
      hasISB: this.combatants.selected.hasBuff(SPELLS.IRONSKIN_BREW_BUFF.id, absorbEvent.timestamp),
      rawDamage: dmgEvent.amount + (dmgEvent.absorbed || 0),
      abilityId: dmgEvent.ability.guid,
      abilityType: dmgEvent.ability.type,
      ability: dmgEvent.ability,
      percentAbsorbed: absorbEvent.amount / (dmgEvent.amount + dmgEvent.absorbed),
      agility: this.stats.currentAgilityRating,
      hasHT: this._isUsingHT,
    });
  }

  _staggerCSV() {
    const keys = [
      'timestamp',
      'abilityId',
      'abilityType',
      'amount',
      'rawDamage',
      'percentAbsorbed',
      'agility',
      'hasISB',
      'hasHT',
    ];
    const csvText = this._staggerData.map(datum => keys.map(k => String(datum[k])).join(',')).join('\n');
    return "data:text/plain;base64," + btoa(keys.join(',') + '\n' + csvText);
  }

  tab() {
    return {
      title: 'Staggered Hits',
      url: 'staggered-hits',
      render: () => (
        <Tab>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ability</th>
                <th>Amount Absorbed</th>
                <th>Total Hit</th>
                <th>%</th>
                <th>Agility</th>
                <th>Was <SpellLink id={SPELLS.IRONSKIN_BREW.id} />?</th>
                <th>Physical?</th>
              </tr>
            </thead>
            <tbody>
              {
                this.tableData.map((datum, i) => (
                  <tr key={i}>
                    <td>
                      <SpellLink id={datum.ability.guid} icon={false}>
                        <Icon icon={datum.ability.abilityIcon} alt={datum.ability.name} /> {datum.ability.name}
                      </SpellLink>
                    </td>
                    <td>{formatNumber(datum.amount)}</td>
                    <td>{formatNumber(datum.rawDamage)}</td>
                    <td>{formatPercentage(datum.percentAbsorbed)}%</td>
                    <td>{formatNumber(datum.agility)}</td>
                    <td>{datum.hasISB ? "Yes" : "No"}</td>
                    <td>{(datum.ability.type === SCHOOLS.ids.PHYSICAL) ? "Yes" : "No"}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <div style={{padding: "10px"}}>
            <a download="stagger.csv" href={this._staggerCSV()}>Download CSV</a>
          </div>
        </Tab>
      ),
    };
  }
}

export default StaggerTable;
