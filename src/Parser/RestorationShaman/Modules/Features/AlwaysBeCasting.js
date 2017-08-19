import React from 'react';

import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';

import CoreAlwaysBeCastingHealing from 'Parser/Core/Modules/AlwaysBeCastingHealing';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const HEALING_ABILITIES_ON_GCD = [
  SPELLS.HEALING_WAVE.id,
  SPELLS.CHAIN_HEAL.id,
  SPELLS.HEALING_SURGE.id,
  SPELLS.RIPTIDE.id,
  SPELLS.HEALING_RAIN_CAST.id,
  SPELLS.HEALING_STREAM_TOTEM_CAST.id,
  SPELLS.HEALING_TIDE_TOTEM_CAST.id,
  SPELLS.SPIRIT_LINK_TOTEM.id,
  SPELLS.GIFT_OF_THE_QUEEN.id,
  SPELLS.WELLSPRING.id,
  SPELLS.CLOUDBURST_TOTEM_CAST.id,
  SPELLS.EARTHEN_SHIELD_TOTEM_CAST.id,
  SPELLS.UNLEASH_LIFE.id,
];

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = HEALING_ABILITIES_ON_GCD;
  static ABILITIES_ON_GCD = [
    ...HEALING_ABILITIES_ON_GCD,
    192063, // Gust of Wind
    192077, // Wind Rush Totem
    192058, // Lightning Surge Totem
    51485, // Earthgrab totem
    196932, // Voodoo totem
    207399, // APT 
    403, // Lightning Bolt
    188838, // Flame shock
    2484, // Earthbind totem
    51505, // Lava Burst
    6196, // Far sight
    2645, // Ghost wolf
    77130, // Purify spirit
    421, // Chain lightning
    546, // water walking
    211004, 51514, 211010, 210873, 211015, // Variants of hex
    556, // Astral recall
    370, // purge
  ];

  suggestions(when) {
    const nonHealingTimePercentage = this.totalHealingTimeWasted / this.owner.fightDuration;
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;
    when(nonHealingTimePercentage).isGreaterThan(0.3)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(`Your non healing time can be improved. Try to cast heals more regularly (${Math.round(nonHealingTimePercentage * 100)}% non healing time).`)
          .icon('petbattle_health-down')
          .actual(`${formatPercentage(actual)}% non healing time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.15)
      );
    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(`Your dead GCD time can be improved. Try to Always Be Casting (ABC); when you're not healing try to contribute some damage (${Math.round(deadTimePercentage * 100)}% dead GCD time).`)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(deadTimePercentage)}% dead GCD time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2)
      );
  }

  statistic() {
    const nonHealingTimePercentage = this.totalHealingTimeWasted / this.owner.fightDuration;
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<Icon icon="petbattle_health-down" alt="Non healing time" />}
        value={`${formatPercentage(nonHealingTimePercentage)} %`}
        label="Non healing time"
        tooltip={`Non healing time is available casting time not used for a spell that helps you heal. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), DPSing, etc. <br /><br />You spent ${formatPercentage(deadTimePercentage)}% of your time casting nothing at all.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default AlwaysBeCasting;
