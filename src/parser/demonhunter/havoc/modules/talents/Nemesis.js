import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';

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
    enemies: Enemies,
  };

  everHadNemesisBuff = false;
  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NEMESIS_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  get hasNemesisBuff() {
    const buffs = this.selectedCombatant.activeBuffs();
    return buffs.some(buff => NEMESIS_BUFF_IDS.includes(buff.ability.guid));
  }

  onDamage(event) {
    if (event.targetIsFriendly) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (this.hasNemesisBuff) {
      this.everHadNemesisBuff = true;
    }
    if (enemy && (enemy.hasBuff(SPELLS.NEMESIS_TALENT.id) || this.hasNemesisBuff)) {
      this.bonusDmg += calculateEffectiveDamage(event, NEMESIS_DAMAGE_MODIFIER);
    }
  }

  get nemesisUptimePercent() {
    const enemyUptime = this.enemies.getBuffUptime(SPELLS.NEMESIS_TALENT.id);
    const playerUptime = NEMESIS_BUFF_IDS.reduce((uptime, spellId) => uptime + this.selectedCombatant.getBuffUptime(spellId), 0);
    return (enemyUptime + playerUptime) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(3)}
        icon={<SpellIcon id={SPELLS.NEMESIS_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%`}
        label="Damage Contributed"
        tooltip={(
          <>
            Nemesis Contributed {formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS / {formatNumber(this.bonusDmg)} total damage.<br />
            You had {formatPercentage(this.nemesisUptimePercent)}% uptime.
            {this.everHadNemesisBuff && <><br /><br /> Due to technical limitations it is not currently possible to tell if your Nemesis buff type is the same as the boss type. This limitation may cause the damage contributed by Nemesis to appear higher than it otherwise would.</>}
          </>
        )}
      />
    );
  }
}

export default Nemesis;
