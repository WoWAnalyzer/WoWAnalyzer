import React from 'react';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import MAGIC_SCHOOLS from 'common/MAGIC_SCHOOLS';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import DamageValue from './DamageValue';

class DamageTaken extends Module {
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
      return new DamageValue(0, 0, 0);
    }
    return this._byAbility[spellId];
  }

  _byMagicSchool = {};
  byMagicSchool(magicSchool) {
    if (!this._byMagicSchool[magicSchool]) {
      return new DamageValue(0, 0, 0);
    }
    return this._byMagicSchool[magicSchool];
  }

  on_toPlayer_damage(event) {
    this._addDamage(event.ability, event.amount, event.absorbed, event.overkill);
  }

  _addDamage(ability, amount = 0, absorbed = 0, overkill = 0) {
    const spellId = ability.guid;
    if (this.constructor.IGNORED_ABILITIES.indexOf(spellId) !== -1) {
      // Some player abilities (mostly of healers) cause damage as a side-effect, these shouldn't be included in the damage taken.
      return;
    }
    this._total = this._total.add(amount, absorbed, overkill);

    if (this._byAbility[spellId]) {
      this._byAbility[spellId] = this._byAbility[spellId].add(amount, absorbed, overkill);
    } else {
      this._byAbility[spellId] = new DamageValue(amount, absorbed, overkill);
    }

    const magicSchool = ability.type;
    if (this._byMagicSchool[magicSchool]) {
      this._byMagicSchool[magicSchool] = this._byMagicSchool[magicSchool].add(amount, absorbed, overkill);
    } else {
      this._byMagicSchool[magicSchool] = new DamageValue(amount, absorbed, overkill);
    }
  }
  _subtractDamage(ability, amount = 0, absorbed = 0, overkill = 0) {
    return this._addDamage(ability, -amount, -absorbed, -overkill);
  }

  showStatistic = false;
  statisticIcon = 'spell_holy_devotionaura';
  statistic() {
    return this.showStatistic && (
      <StatisticBox
        icon={<Icon icon={this.statisticIcon} alt="Damage taken" />}
        value={`${formatNumber(this.total.raw / this.owner.fightDuration * 1000)} DTPS`}
        label="Damage taken"
        tooltip={`The total damage taken was ${formatThousands(this.total.effective)} (${formatThousands(this.total.overkill)} overkill).<br /><br />

          Damage taken by magic school:
          <ul>
            ${Object.keys(this._byMagicSchool)
            .map(type => `<li><i>${MAGIC_SCHOOLS.names[type] || 'Unknown'}</i> damage taken ${formatThousands(this._byMagicSchool[type].effective)} (${formatPercentage(this._byMagicSchool[type].effective / this.total.effective)}%)</li>`)
            .join('')}
          </ul>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default DamageTaken;
