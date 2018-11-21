import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import Events from 'parser/core/Events';

/**
 * Transform into a colossus for 20 sec, causing you to deal 20% increased damage
 * and removing all roots and snares.
 */

const AVATAR_BONUS_DAMAGE = 0.2;

class Avatar extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AVATAR_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this._onDamage);
  }

  totalDamages = 0;

  _onDamage(event) {
    if (event.targetIsFriendly || !this.selectedCombatant.hasBuff(SPELLS.AVATAR_TALENT.id, event.timestamp)) {
      return;
    }
    this.totalDamages += calculateEffectiveDamage(event, AVATAR_BONUS_DAMAGE);
  }

  get dps() {
    return this.totalDamages / this.owner.fightDuration * 1000;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.AVATAR_TALENT.id} /> bonus damage</>}
        value={`${formatThousands(this.dps)} DPS`}
        valueTooltip={`Your Avatar contributed ${formatThousands(this.totalDamages)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDamages))} %).<br />This only accounts for the passive 20% increased damage of Avatar.`}
      />
    );
  }
}

export default Avatar;
