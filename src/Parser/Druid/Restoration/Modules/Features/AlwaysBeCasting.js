import SPELLS from 'common/SPELLS';
import CoreAlwaysBeCastingHealing from 'Parser/Core/Modules/AlwaysBeCastingHealing';
import { formatPercentage } from 'common/format';

const HEALING_ABILITIES_ON_GCD = [
  SPELLS.REJUVENATION.id,
  SPELLS.REGROWTH.id,
  SPELLS.WILD_GROWTH.id,
  SPELLS.HEALING_TOUCH.id,
  SPELLS.TRANQUILITY_CAST.id,
  SPELLS.CENARION_WARD.id,
  SPELLS.LIFEBLOOM_HOT_HEAL.id,
  SPELLS.SWIFTMEND.id,
  SPELLS.FRENZIED_REGENERATION.id,
  SPELLS.RENEWAL_TALENT.id,
  SPELLS.ESSENCE_OF_GHANIR.id,
  SPELLS.FLOURISH_TALENT.id,
  SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id,
  SPELLS.INNERVATE.id,
  SPELLS.EFFLORESCENCE_CAST.id,
  SPELLS.NATURES_CURE.id,
];

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = HEALING_ABILITIES_ON_GCD;
  static ABILITIES_ON_GCD = [
    ...HEALING_ABILITIES_ON_GCD,
    SPELLS.BEAR_FORM.id,
    SPELLS.CAT_FORM.id,
    SPELLS.DASH.id,
    SPELLS.DISPLACER_BEAST_TALENT.id,
    SPELLS.FEROCIOUS_BITE.id,
    SPELLS.RAKE.id,
    SPELLS.MASS_ENTANGLEMENT_TALENT.id,
    SPELLS.STAG_FORM.id,
    SPELLS.TRAVEL_FORM.id,
    SPELLS.RIP.id,
    SPELLS.SHRED.id,
    SPELLS.SOLAR_WRATH.id,
    SPELLS.SUNFIRE_CAST.id,
    SPELLS.MOONFIRE.id,
    SPELLS.CAT_SWIPE.id,
    SPELLS.SWIPE_BEAR.id,
    SPELLS.URSOLS_VORTEX.id,
    SPELLS.MIGHTY_BASH_TALENT.id,
    SPELLS.TYPHOON_TALENT.id,
    SPELLS.MOONKIN_FORM.id,
    SPELLS.STARSURGE.id,
    // SPELLS.LUNAR_STRIKE.id,
    // SPELLS.MANGLE.id,
    // SPELLS.TRASH.id,
    // SPELLS.IRONFUR.id
  ];

  get nonHealingTimePercentage() {
    return this.totalHealingTimeWasted / this.owner.fightDuration;
  }

  get nonCastingTimePercentage() {
    return this.totalTimeWasted / this.owner.fightDuration;
  }

  get nonHealingSuggestionThresholds() {
    return {
      actual: this.nonHealingTimePercentage,
      isGreaterThan: {
        minor: 0.30,
        average: 0.45,
        major: 1.00,
      },
      style: 'percentage',
    };
  }

  get nonCastingSuggestionThresholds() {
    return {
      actual: this.nonCastingTimePercentage,
      isGreaterThan: {
        minor: 0.20,
        average: 0.35,
        major: 0.50,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.nonHealingSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your non healing time can be improved. Try to reduce the delay between casting spells and try to continue healing when you have to move.')
          .icon('petbattle_health-down')
          .actual(`${formatPercentage(actual)}% non healing time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });

    when(this.nonCastingSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your downtime can be improved. Try to Always Be Casting (ABC); try to reduce the delay between casting spells and when you\'re not healing try to contribute some damage.')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default AlwaysBeCasting;
