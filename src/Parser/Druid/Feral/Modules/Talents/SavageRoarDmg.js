import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

import getDamageBonus from '../FeralCore/getDamageBonus';
import { SAVAGE_ROAR_DAMAGE_BONUS } from '../../Constants';

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
  SPELLS.MELEE.id,
  SPELLS.SHRED.id,
  SPELLS.RAKE.id,
  SPELLS.RIP.id,
  SPELLS.FEROCIOUS_BITE.id,
  SPELLS.MOONFIRE_FERAL.id,
  SPELLS.THRASH_FERAL.id,
  SPELLS.SWIPE_CAT.id,
  SPELLS.FERAL_FRENZY_TALENT.id,
  SPELLS.MAIM.id,
  SPELLS.MOONFIRE.id, // not really a cat ability, but is affected
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
  }

  on_byPlayer_damage(event) {
    if (!AFFECTED_BY_SAVAGE_ROAR.includes(event.ability.guid) ||
        !this.selectedCombatant.hasBuff(SPELLS.SAVAGE_ROAR_TALENT.id) ||
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
        tooltip={`Your Savage Roar talent contributed <b>${formatNumber(this.bonusDmg)}</b> total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default SavageRoar;
