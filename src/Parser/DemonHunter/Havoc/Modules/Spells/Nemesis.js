import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const NEMESIS_BUFF_IDS = [
  SPELLS.NEMESIS_DEMON.id,
  SPELLS.NEMESIS_HUMANOID.id,
  SPELLS.NEMESIS_ABERRATION.id,
  SPELLS.NEMESIS_BEAST.id,
  SPELLS.NEMESIS_CRITTER.id,
  SPELLS.NEMESIS_DRAGONKIN.id,
  SPELLS.NEMESIS_ELEMENTAL.id,
  SPELLS.NEMESIS_GIANT.id,
  SPELLS.NEMESIS_MECHANICAL.id,
  SPELLS.NEMESIS_UNDEAD.id,
];

const NEMESIS_DAMAGE_MODIFIER = 0.25;

class Nemesis extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.NEMESIS_TALENT.id);
  }

  get hasNemesisBuff() {
    const buffs = this.combatants.selected.activeBuffs();
    return buffs.some(buff => NEMESIS_BUFF_IDS.includes(buff.ability.guid));
  }

  on_byPlayer_damage(event) {
    if(event.targetIsFriendly) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    console.log(enemy)
    if(enemy.hasBuff(SPELLS.NEMESIS_TALENT.id) || this.hasNemesisBuff) {
      this.bonusDmg += calculateEffectiveDamage(event, NEMESIS_DAMAGE_MODIFIER);
    }
  }

  get nemesisUptimePercent() {
    const enemyUptime = this.enemies.getBuffUptime(SPELLS.NEMESIS_TALENT.id);
    const playerUptime = NEMESIS_BUFF_IDS.reduce((uptime, spellId) => uptime + this.combatants.selected.getBuffUptime(spellId), 0);
    return (enemyUptime + playerUptime) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.NEMESIS_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%`}
        label="Damage Contributed"
        tooltip={`Nemesis Contributed ${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS / ${formatNumber(this.bonusDmg)} total damage. <br/> You had ${formatPercentage(this.nemesisUptimePercent)}% uptime.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Nemesis;
