import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCastingHealing extends CoreAlwaysBeCasting {
  static HEALING_ABILITIES_ON_GCD = [
    // Extend this class and override this property in your spec class to implement this module.
  ];

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

    if (this.countsAsHealingAbility(cast)) {
      const healTimeWasted = castStartTimestamp - (this.lastHealingCastFinishedTimestamp || this.owner.fight.start_time);
      this.totalHealingTimeWasted += healTimeWasted;
      this.lastHealingCastFinishedTimestamp = Math.max(castStartTimestamp + globalCooldown, cast.timestamp);
    }
  }
  countsAsHealingAbility(cast) {
    return this.constructor.HEALING_ABILITIES_ON_GCD.indexOf(cast.ability.guid) !== -1;
  }
}

export default AlwaysBeCastingHealing;
