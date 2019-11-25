import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const ABILITIES_AFFECTED_BY_NIGHTBLADE = [
  SPELLS.SECRET_TECHNIQUE_TALENT,
  SPELLS.GLOOMBLADE_TALENT,
  SPELLS.EVISCERATE,
  SPELLS.BACKSTAB,
  SPELLS.SHURIKEN_TOSS,
  SPELLS.SHADOWSTRIKE,
  SPELLS.SHURIKEN_STORM,
];

class NightbladeUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    damageTracker: DamageTracker,

  };

  constructor(...args) {
    super(...args);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_NIGHTBLADE), this.handleDamage);
  }

  buffedDamage = 0;
  totalDamage = 0;
  damageBonus = 0;

  handleDamage(event) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }
    if(target.hasBuff(SPELLS.NIGHTBLADE.id)){
      this.buffedDamage += calculateEffectiveDamage(event,1);
      this.damageBonus += calculateEffectiveDamage(event,0.15);
    }
    this.totalDamage += calculateEffectiveDamage(event,1);
  }

  get percentUptime() {
    return this.enemies.getBuffUptime(SPELLS.NIGHTBLADE.id) / this.owner.fightDuration;
  }

  get buffedPercent() {
    return 1 - (this.totalDamage - this.buffedDamage) / this.totalDamage;
  }

  get uptimeThresholds() {
    return {
      actual: this.percentUptime,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.9,
      },
      style: 'percentage',
    };
  }

  get effectThresholds() {
    return {
      actual: this.buffedPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(120)}
        icon={<SpellIcon id={SPELLS.NIGHTBLADE.id} />}
        value={`${formatPercentage(this.buffedPercent)}%`}
        label={`Damage Buffed by Nightblade`}
        tooltip={<>You buffed <b> {formatPercentage(this.buffedPercent)}% </b> of your damage by Nightblade. <br />The total increase was <b>{formatNumber(this.damageBonus/this.owner.fightDuration * 1000)} DPS </b></>}
      />
    );
  }
}

export default NightbladeUptime;
