import React from 'react';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
    static ABILITIES_ON_GCD = [
      //Rotational
      SPELLS.DEVASTATE.id,
      SPELLS.REVENGE.id,
      SPELLS.SHIELD_SLAM.id,
      SPELLS.THUNDER_CLAP.id,
      //Mitigation
      SPELLS.IGNORE_PAIN.id,
      SPELLS.NELTHARIONS_FURY.id,
      SPELLS.SHIELD_BLOCK.id,
      //Cooldowns
      SPELLS.DEMORALIZING_SHOUT.id,
      SPELLS.LAST_STAND.id,
      SPELLS.SHIELD_WALL.id,
      SPELLS.SPELL_REFLECTION.id,
      //Utility
      SPELLS.HEROIC_LEAP.id,
      SPELLS.HEROIC_THROW.id,
      SPELLS.INTERCEPT.id,
      SPELLS.TAUNT.id,

      //Shared
      SPELLS.BATTLE_CRY.id,
      SPELLS.BERSERKER_RAGE.id,
      SPELLS.PUMMEL.id,
      SPELLS.VICTORY_RUSH.id,

      //Talents
      SPELLS.SHOCKWAVE_TALENT.id,
      SPELLS.STORM_BOLT_TALENT.id,
      SPELLS.AVATAR_TALENT.id,
      SPELLS.IMPENDING_VICTORY_TALENT.id,
      SPELLS.RAVAGER_TALENT_PROTECTION.id,
    ];

    suggestions(when) {
      const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

      when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your dead GCD time can be improved. Try to Always Be Casting (ABC)..</span>)
        .icon('spell_mage_altertime')
        .actual(`${formatPercentage(actual)}% dead GCD time`)
        .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
        .regular(recommended + 0.05).major(recommended + 0.15);
      });
    }

    statistic() {
      const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

      return (
        <StatisticBox
        icon={<Icon icon="spell_mage_altertime" alt="Dead GCD time" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label="Dead GCD time"
        tooltip="Dead GCD time is available casting time not used. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), etc."
        />
      );
}
 statisticOrder = STATISTIC_ORDER.CORE(2);
}

 export default AlwaysBeCasting;
