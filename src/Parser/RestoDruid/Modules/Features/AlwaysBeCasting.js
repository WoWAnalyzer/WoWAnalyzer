import SPELLS from 'common/SPELLS';
import CoreAlwaysBeCastingHealing from 'Parser/Core/Modules/AlwaysBeCastingHealing';

const HEALING_ABILITIES_ON_GCD = [
  SPELLS.REJUVENATION.id,
  SPELLS.REGROWTH.id,
  SPELLS.WILD_GROWTH.id,
  SPELLS.HEALING_TOUCH.id,
  SPELLS.TRANQUILITY.id,
  SPELLS.CENARION_WARD.id,
  SPELLS.LIFEBLOOM.id,
  SPELLS.SWIFTMEND.id,
  SPELLS.FRENZIED_REGENERATION.id,
  SPELLS.RENEWAL_TALENT.id,
  SPELLS.ESSENCE_OF_GHANIR.id,
  SPELLS.FLOURISH_TALENT.id,
  SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id,
  SPELLS.INNERVATE.id,
  SPELLS.EFFLORESCENCE.id,
  SPELLS.NATURES_CURE.id,
  SPELLS.RENEWAL.id,
];

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = HEALING_ABILITIES_ON_GCD;
  static ABILITIES_ON_GCD = [
    ...HEALING_ABILITIES_ON_GCD,
    SPELLS.BEAR_FORM.id,
    SPELLS.CAT_FORM.id,
    SPELLS.DASH.id,
    SPELLS.DISPLACER_BEAST.id,
    SPELLS.FEROCIOUS_BITE.id,
    SPELLS.RAKE.id,
    SPELLS.MASS_ENTANGLEMENT.id,
    SPELLS.STAG_FORM.id,
    SPELLS.TRAVEL_FORM.id,
    SPELLS.RIP.id,
    SPELLS.SHRED.id,
    SPELLS.SOLAR_WRATH.id,
    SPELLS.CAT_SWIPE.id,
    SPELLS.BEAR_SWIPE.id,
    SPELLS.URSOLS_VORTEX.id,
    SPELLS.MIGHTY_BASH.id,
    SPELLS.TYPHOON.id,
    SPELLS.MOONKIN_FORM.id,
    SPELLS.STARSURGE.id,
    // SPELLS.LUNAR_STRIKE.id,
    // SPELLS.MANGLE.id,
    // SPELLS.TRASH.id,
    // SPELLS.IRONFUR.id
  ];
  on_initialized(event) {
    super.on_initialized(arguments);
  }

  recordCastTime(
    castStartTimestamp,
    globalCooldown,
    begincast,
    cast,
    spellId
  ) {

    super.recordCastTime(
      castStartTimestamp,
      globalCooldown,
      begincast,
      cast,
      spellId
    );
  }

  static inRange(num1, goal, buffer) {
    return num1 > (goal - buffer) && num1 < (goal + buffer);
  }
}

export default AlwaysBeCasting;
