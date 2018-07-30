import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import { formatPercentage } from 'common/format';

/**
 * Raptor Strike (or Monogoose Bite) has a chance to make your next
 * Serpent Sting cost no Focus and deal an additional 250% initial damage.
 */
const DAMAGE_MODIFIER = 2.5;

class VipersVenom extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  buffedSerpentSting = false;
  bonusDamage = 0;
  procs = 0;
  lastProcTimestamp = 0;
  accumulatedTimeFromBuffToCast = 0;
  currentGCD = 0;
  wastedProcs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.VIPERS_VENOM_TALENT.id);
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERPENT_STING_SV.id || !this.selectedCombatant.hasBuff(SPELLS.VIPERS_VENOM_BUFF.id)) {
      return;
    }
    this.buffedSerpentSting = true;
    this.accumulatedTimeFromBuffToCast += event.timestamp - this.lastProcTimestamp - this.currentGCD;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERPENT_STING_SV.id || !this.buffedSerpentSting) {
      return;
    }
    this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_MODIFIER);
    this.buffedSerpentSting = false;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VIPERS_VENOM_BUFF.id) {
      return;
    }
    this.procs++;
    this.lastProcTimestamp = event.timestamp;
    this.currentGCD = (Math.max(1.5 / (1 + this.statTracker.currentHastePercentage), 0.75) * 1000);
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VIPERS_VENOM_BUFF.id) {
      return;
    }
    this.wastedProcs++;
  }

  get averageTimeBetweenBuffAndUsage() {
    return (this.accumulatedTimeFromBuffToCast / this.procs / 1000).toFixed(2);
  }

  get TimeBetweenBuffAndCastThreshold() {
    return {
      actual: this.averageTimeBetweenBuffAndUsage,
      isGreaterThan: {
        minor: 1,
        average: 2,
        major: 3,
      },
      style: 'decimal',
    };
  }
  get wastedProcsThreshold() {
    return {
      actual: this.wastedProcs,
      isGreaterThan: {
        minor: 1,
        average: 3,
        major: 5,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.TimeBetweenBuffAndCastThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Remember to cast <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> as fast as possible after proccing <SpellLink id={SPELLS.VIPERS_VENOM_TALENT} />.</React.Fragment>)
        .icon(SPELLS.VIPERS_VENOM_TALENT.icon)
        .actual(`${actual} seconds between buff and cast`)
        .recommended(`<${formatPercentage(recommended)} second is recommended`);
    });
    when(this.wastedProcsThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Remember to utilise all your <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> procs.</React.Fragment>)
        .icon(SPELLS.VIPERS_VENOM_TALENT.icon)
        .actual(`${actual} wasted procs of Viper's Venom`)
        .recommended(`<${recommended} is recommended`);
    });
  }

  statistic() {
    let tooltip = `<ul><li>Average time between gaining Viper's Venom buff and using it was <b>${this.averageTimeBetweenBuffAndUsage}</b> seconds. <ul><li>Note: This accounts for the GCD after the Raptor Strike proccing Viper's Venom. </li>`;
    tooltip += this.wastedProcs > 0 ? `<li>You wasted ${this.wastedProcs} procs by gaining a new proc, whilst your current proc was still active.</li>` : ``;
    tooltip += `</ul></li></ul>`;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VIPERS_VENOM_TALENT.id} />}
        value={`${this.procs}`}
        label="Viper's Venom procs"
        tooltip={tooltip}
      />
    );
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.bonusDamage} />
        </div>
      </div>
    );
  }

}

export default VipersVenom;
