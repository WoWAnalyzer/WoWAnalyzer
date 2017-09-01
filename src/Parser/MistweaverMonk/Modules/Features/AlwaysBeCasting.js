import React from 'react';

import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import CoreAlwaysBeCastingHealing from 'Parser/Core/Modules/AlwaysBeCastingHealing';

const HEALING_ABILITIES_ON_GCD = [
  SPELLS.EFFUSE.id,
  SPELLS.ENVELOPING_MISTS.id,
  SPELLS.ESSENCE_FONT.id,
  SPELLS.RENEWING_MIST.id,
  SPELLS.VIVIFY.id,
  SPELLS.REVIVAL.id,
  SPELLS.SHEILUNS_GIFT.id,
  SPELLS.CHI_BURST_TALENT.id,
  SPELLS.CHI_WAVE_TALENT.id,
  SPELLS.ZEN_PULSE_TALENT.id,
  SPELLS.REFRESHING_JADE_WIND_TALENT.id,
];

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = HEALING_ABILITIES_ON_GCD;
  static ABILITIES_ON_GCD = [
    ...HEALING_ABILITIES_ON_GCD,
    SPELLS.CHI_TORPEDO_TALENT.id,
    SPELLS.BLACKOUT_KICK.id,
    SPELLS.DETOX.id,
    SPELLS.LEG_SWEEP_TALENT.id,
    SPELLS.PARALYSIS.id,
    SPELLS.ROLL.id,
    SPELLS.RISING_SUN_KICK.id,
    SPELLS.SPINNING_CRANE_KICK.id,
    SPELLS.TIGERS_LUST_TALENT.id,
    SPELLS.CRACKLING_JADE_LIGHTNING.id,
    SPELLS.TRANSCENDENCE.id,
    SPELLS.TRANSCENDENCE_TRANSFER.id,
    SPELLS.TIGER_PALM.id,
  ];

  suggestions(when) {
    const nonHealingTimePercentage = this.totalHealingTimeWasted / this.owner.fightDuration;
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(nonHealingTimePercentage).isGreaterThan(0.5)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your non healing time can be improved. Try to reduce the delay between casting spells and try to continue healing when you have to move.')
          .icon('petbattle_health-down')
          .actual(`${formatPercentage(actual)}% non healing time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.15);
      });
    when(deadTimePercentage).isGreaterThan(0.4)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your dead GCD time can be improved. Try to Always Be Casting (ABC); try to reduce the delay between casting spells and when you\'re not healing try to contribute some damage.')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% dead GCD time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(1);
      });
  }
  statistic() {
    const nonHealingTimePercentage = this.totalHealingTimeWasted / this.owner.fightDuration;
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<Icon icon="petbattle_health-down" alt="Non healing time" />}
        value={`${formatPercentage(nonHealingTimePercentage)} %`}
        label="Non healing time"
        tooltip={`Non healing time is available casting time not used for a spell that helps you heal. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), DPSing, etc. Damaging Holy Shocks are considered non healing time, Crusader Strike is only considered non healing time if you do not have the Crusader's Might talent.<br /><br />You spent ${formatPercentage(deadTimePercentage)}% of your time casting nothing at all.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default AlwaysBeCasting;
