import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { TooltipElement } from 'common/Tooltip';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import { IsPenanceDamageEvent, IsPenanceHealEvent } from 'parser/priest/discipline/modules/spells/Helper';

import isAtonement from '../core/isAtonement';
import Penance from './Penance';

class Castigation extends Analyzer {
  static dependencies = {
    penance: Penance, // we need this to add `penanceBoltNumber` to the damage and heal events
  };

  healing = 0;
  damage = 0;

  _isCastigationBolt = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CASTIGATION_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onDamage(event: DamageEvent ) {
    if (!IsPenanceDamageEvent(event)) {
      return;
    }

    if (event.ability.guid !== SPELLS.PENANCE.id || event.penanceBoltNumber !== 3) {
      this._isCastigationBolt = false;
      return;
    }

    this._isCastigationBolt = true;
    this.damage += event.amount;
  }

  onHeal(event: HealEvent) {
    if (!IsPenanceHealEvent(event)) {
      return;
    }

    const spellId = event.ability.guid;

    // Friendly Penance Healing
    if (spellId === SPELLS.PENANCE_HEAL.id) {
      if (event.penanceBoltNumber === 3) {
        this.healing += event.amount;
      }
    }

    // Offensive Penance Healing
    if (isAtonement(event)) {
      if (this._isCastigationBolt) {
        this.healing += event.amount;
      }
    }
  }

  statistic() {
    const healing = this.healing || 0;
    const damage = this.damage || 0;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CASTIGATION_TALENT.id} />}
        value={`${formatNumber(healing / this.owner.fightDuration * 1000)} HPS`}
        label={(
          <TooltipElement content={`The effective healing contributed by Castigation (${formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing))}% of total healing done). Castigation also contributed ${formatNumber(damage / this.owner.fightDuration * 1000)} DPS (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))}% of total damage done), the healing gain of this damage was included in the shown numbers.`}>
            Castigation healing
          </TooltipElement>
        )}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Castigation;
