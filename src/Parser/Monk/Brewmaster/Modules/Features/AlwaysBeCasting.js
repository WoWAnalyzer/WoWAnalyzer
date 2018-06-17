import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static STATIC_GCD_ABILITIES = {
    [SPELLS.LEG_SWEEP_TALENT.id]: 1000,
    [SPELLS.PARALYSIS.id]: 1000,
    [SPELLS.TRANSCENDENCE.id]: 1000, // unlike Transcendence: Transfer this does have a static GCD
    [SPELLS.TIGER_PALM.id]: 1000,
    [SPELLS.BLACKOUT_STRIKE.id]: 1000,
    [SPELLS.KEG_SMASH.id]: 1000,
    [SPELLS.BREATH_OF_FIRE.id]: 1000,
    [SPELLS.EXPLODING_KEG.id]: 1000,
    [SPELLS.RUSHING_JADE_WIND.id]: 1000,
    [SPELLS.SUMMON_BLACK_OX_STATUE_TALENT.id]: 1000,
    [SPELLS.TIGERS_LUST_TALENT.id]: 1000,
    [SPELLS.RUSHING_JADE_WIND_TALENT.id]: 1000,
    [SPELLS.EXPEL_HARM.id]: 500, // Can be seen on logs, and I verified this in-game myself
    // TODO: Both Roll and Chi Torpedo don't actually have a GCD but block all spells during its animation for about the same duration, so maybe time it in-game and mark it as channeling instead? For now this seems a close match:
    [SPELLS.ROLL.id]: 850,
    [SPELLS.CHI_TORPEDO_TALENT.id]: 850,
    // TODO: Tested in-game: Effuse has a base GCD of 1.5, scales with Haste
    // [SPELLS.EFFUSE.id]: 1000,
    // The spells below were tested in-game: they do NOT have a static GCD but a base GCD of 1sec and scales with Haste
    // [SPELLS.RING_OF_PEACE_TALENT.id]: 1000,
    // [SPELLS.DETOX.id]: 1000,
    // [SPELLS.CRACKLING_JADE_LIGHTNING.id]: 1000,
    // [SPELLS.TRANSCENDENCE_TRANSFER.id]: 1000, also easily verified on logs
  };

  static BASE_GCD = 1000;
  static MINIMUM_GCD = 500; // assumed to be 50% of base, but unverified

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
