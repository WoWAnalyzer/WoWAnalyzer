import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import Events from 'parser/core/Events';

/**
 * Whirlwind deals 10% increased damage, and Slams your primary target.
 *
 * Example log: /report/cM1Kmp3qW8Yvkang/1-LFR+Zul+-+Kill+(4:21)/22-Gorrtil/events
 */

const WHIRLWIND_DAMAGE_BONUS = 0.1;
const MAX_DELAY = 30;

class FervorOfBattle extends Analyzer {

  bonusDamage = 0;
  lastWhirlwindCast = 0;

  whirlwind = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FERVOR_OF_BATTLE_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WHIRLWIND), this._onWhirlwindCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.WHIRLWIND_DAMAGE_1, SPELLS.WHIRLWIND_DAMAGE_2_3, SPELLS.SLAM]), this._onFobDamage);
  }

  _onWhirlwindCast(event) {
    this.lastWhirlwindCast = event.timestamp;
  }

  _onFobDamage(event) {
    const guid = event.ability.guid;
    if (guid === SPELLS.WHIRLWIND_DAMAGE_1.id || guid === SPELLS.WHIRLWIND_DAMAGE_2_3.id) {
      this.bonusDamage += calculateEffectiveDamage(event, WHIRLWIND_DAMAGE_BONUS);
    } else if (guid === SPELLS.SLAM.id && event.timestamp - this.lastWhirlwindCast < MAX_DELAY) {
      this.bonusDamage += event.amount + (event.absorbed || 0);
    }
  }

  get dps() {
    return this.bonusDamage / this.owner.fightDuration * 1000;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.FERVOR_OF_BATTLE_TALENT.id} /> bonus damage</>}
        value={`${formatThousands(this.dps)} DPS`}
        valueTooltip={`Your Fervor of Battle contributed ${formatThousands(this.bonusDamage)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDamage))} %).`}
      />
    );
  }
}

export default FervorOfBattle;
