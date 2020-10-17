import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import getDamageBonus from '../core/getDamageBonus';
import { SAVAGE_ROAR_DAMAGE_BONUS } from '../../constants';
import Events from 'parser/core/Events';

/**
 * Since 8.0 only affects "cat" abilities.
 * Tested and found not to be affected:
 *  Damage procs from trinkets
 *  DoT from bear's Thrash
 *  Sunfire from balance affinity
 *
 * Presumably would affect Brutal Slash, but they're rival talents.
 */
const AFFECTED_BY_SAVAGE_ROAR = [
  SPELLS.MELEE,
  SPELLS.SHRED,
  SPELLS.RAKE,
  SPELLS.RIP,
  SPELLS.FEROCIOUS_BITE,
  SPELLS.MOONFIRE_FERAL,
  SPELLS.THRASH_FERAL,
  SPELLS.SWIPE_CAT,
  SPELLS.FERAL_FRENZY_TALENT,
  SPELLS.MAIM,
  SPELLS.MOONFIRE, // not really a cat ability, but is affected
];

/**
 * "Finishing move that increases damage by 15% while in Cat Form."
 */
class SavageRoar extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_BY_SAVAGE_ROAR), this.onDamage);
  }

  onDamage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SAVAGE_ROAR_TALENT.id) ||
        !this.selectedCombatant.hasBuff(SPELLS.CAT_FORM.id)) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, SAVAGE_ROAR_DAMAGE_BONUS);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SAVAGE_ROAR_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={<>Your Savage Roar talent contributed <strong>{formatNumber(this.bonusDmg)}</strong> total damage ({formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%).</>}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      />
    );
  }
}

export default SavageRoar;
