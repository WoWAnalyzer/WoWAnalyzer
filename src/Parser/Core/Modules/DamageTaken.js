import React from 'react';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import SPELLS from 'common/SPELLS';
import MAGIC_SCHOOLS from 'common/MAGIC_SCHOOLS';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Toggleable from 'Main/Toggleable';
import DamageValue from './DamageValue';

class DamageTaken extends Analyzer {
  static IGNORED_ABILITIES = [
    SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id,
  ];

  _total = new DamageValue(); // consider this "protected", so don't change this from other modules. If you want special behavior you must add that code to an extended version of this module.
  get total() {
    return this._total;
  }

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
    this._addDamage(event.ability, event.amount, event.absorbed, event.blocked, event.overkill);
  }

  _addDamage(ability, amount = 0, absorbed = 0, blocked = 0, overkill = 0) {
    const spellId = ability.guid;
    if (this.constructor.IGNORED_ABILITIES.indexOf(spellId) !== -1) {
      // Some player abilities (mostly of healers) cause damage as a side-effect, these shouldn't be included in the damage taken.
      return;
    }
    this._total = this._total.add(amount, absorbed, blocked, overkill);

    if (this._byAbility[spellId]) {
      this._byAbility[spellId] = this._byAbility[spellId].add(amount, absorbed, blocked, overkill);
    } else {
      this._byAbility[spellId] = new DamageValue(amount, absorbed, blocked, overkill);
    }

    const magicSchool = ability.type;
    if (this._byMagicSchool[magicSchool]) {
      this._byMagicSchool[magicSchool] = this._byMagicSchool[magicSchool].add(amount, absorbed, blocked, overkill);
    } else {
      this._byMagicSchool[magicSchool] = new DamageValue(amount, absorbed, blocked, overkill);
    }
  }
  _subtractDamage(ability, amount = 0, absorbed = 0, blocked = 0, overkill = 0) {
    return this._addDamage(ability, -amount, -absorbed, -blocked, -overkill);
  }

  get tooltip(){
      const physical = (this._byMagicSchool[MAGIC_SCHOOLS.ids.PHYSICAL])?this._byMagicSchool[MAGIC_SCHOOLS.ids.PHYSICAL].effective : 0;
      const magical = this.total.effective - physical;
      return `Damage taken by type:
      <ul>
      <li><b>Physical</b>: ${formatThousands(physical)} (${formatPercentage(physical / this.total.effective)}%)</li>
      <li><b>Magic</b>: ${formatThousands(magical)} (${formatPercentage(magical / this.total.effective)}%)</li>
      </ul>
      Damage taken by magic school:
      <ul>
        ${Object.keys(this._byMagicSchool)
          .filter(type => this._byMagicSchool[type].effective !== 0)
          .map(type => `<li><b>${MAGIC_SCHOOLS.names[type] || 'Unknown'}</b>: ${formatThousands(this._byMagicSchool[type].effective)} (${formatPercentage(this._byMagicSchool[type].effective / this.total.effective)}%)</li>`
          )
      .join('')}
      </ul>
      Click the bar to switch between simple and detailed mode.`;
  }

  showStatistic = false;
  statistic() {
    // TODO: Add a bar showing magic schools
    const physical = (this._byMagicSchool[MAGIC_SCHOOLS.ids.PHYSICAL])?this._byMagicSchool[MAGIC_SCHOOLS.ids.PHYSICAL].effective : 0;
    const magical = this.total.effective - physical;
    const simplifiedValues = {
      [MAGIC_SCHOOLS.ids.PHYSICAL]: physical,
      [MAGIC_SCHOOLS.ids.SHADOW]: magical, // use shadow as placeholder for general magic
    };

    return this.showStatistic && (
      <StatisticBox
        icon={(
          <img
            src="/img/shield.png"
            style={{ border: 0 }}
            alt="Shield"
          />
        )}
        value={`${formatNumber(this.total.raw / this.owner.fightDuration * 1000)} DTPS`}
        label="Damage taken"
        tooltip={
          `The total damage taken was ${formatThousands(this.total.effective)} (${formatThousands(this.total.overkill)} overkill).`
        }
        footer={(
          <Toggleable
            className="statistic-bar"
            data-tip={this.tooltip}
            value = {
              Object.keys(simplifiedValues)
                .map(type =>
                  (
                    <div
                      key={type}
                      className={`spell-school-${type}-bg`}
                      style={{ width: `${simplifiedValues[type] / this.total.effective * 100}%` }}
                    />
                  )
                )
            }
            toggledvalue = {
              Object.keys(this._byMagicSchool)
                .filter(type => this._byMagicSchool[type].effective !== 0)
                .map(type =>
                  (
                    <div
                      key={type}
                      className={`spell-school-${type}-bg`}
                      style={{ width: `${this._byMagicSchool[type].effective / this.total.effective * 100}%` }}
                    />
                  )
                )
            }
          />
        )}
        footerStyle={{ overflow: 'hidden'}}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default DamageTaken;
