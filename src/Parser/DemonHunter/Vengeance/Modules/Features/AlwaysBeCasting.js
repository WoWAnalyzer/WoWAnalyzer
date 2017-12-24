import SPELLS from 'common/SPELLS';

import { formatPercentage } from 'common/format';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [

    // Abilities
    SPELLS.IMMOLATION_AURA.id,
    SPELLS.IMPRISON.id,
    SPELLS.SHEAR.id,
    SPELLS.SIGIL_OF_FLAME.id,
    SPELLS.SIGIL_OF_MISERY.id,
    SPELLS.SIGIL_OF_SILENCE.id,
    SPELLS.SOUL_CARVER.id,
    SPELLS.SOUL_CLEAVE.id,
    SPELLS.THROW_GLAIVE.id,

    // Talents
    SPELLS.FELBLADE_TALENT.id,
    SPELLS.FEL_DEVASTATION_TALENT.id,
    SPELLS.FEL_ERUPTION_TALENT.id,
    SPELLS.FRACTURE_TALENT.id,
    SPELLS.SIGIL_OF_CHAINS_TALENT.id,
    SPELLS.SOUL_BARRIER_TALENT.id,
    SPELLS.SPIRIT_BOMB_TALENT.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.20)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your downtime can be improved. Try to Always Be Casting (ABC); try to reduce the delay between casting spells and when you\'re not healing try to contribute some damage.')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.15);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default AlwaysBeCasting;
