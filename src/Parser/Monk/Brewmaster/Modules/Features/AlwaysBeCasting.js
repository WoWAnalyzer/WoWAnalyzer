import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.CHI_TORPEDO_TALENT.id,
    SPELLS.DETOX.id,
    SPELLS.LEG_SWEEP_TALENT.id,
    SPELLS.PARALYSIS.id,
    SPELLS.ROLL.id,
    SPELLS.CRACKLING_JADE_LIGHTNING.id,
    SPELLS.TRANSCENDENCE.id,
    SPELLS.TRANSCENDENCE_TRANSFER.id,
    SPELLS.TIGER_PALM.id,
    SPELLS.BLACKOUT_STRIKE.id,
    SPELLS.KEG_SMASH.id,
    SPELLS.BREATH_OF_FIRE.id,
    SPELLS.EXPLODING_KEG.id,
    SPELLS.RUSHING_JADE_WIND.id,
    SPELLS.EXPEL_HARM.id,
    SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id,
    SPELLS.RING_OF_PEACE_TALENT.id,
    SPELLS.SUMMON_BLACK_OX_STATUE_TALENT.id,
    SPELLS.EFFUSE.id,
    SPELLS.TIGERS_LUST_TALENT.id,
  ];

  static MINIMUM_GCD = 1000; // it's capped to 1sec, reduced with haste from player

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.15);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default AlwaysBeCasting;
