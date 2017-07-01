import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import CoreAlwaysBeCastingHealing from 'Parser/Core/Modules/AlwaysBeCastingHealing';

const debug = true;

const HEALING_ABILITIES_ON_GCD = [
  SPELLS.GREATER_HEAL.id,
  SPELLS.FLASH_HEAL.id,
  SPELLS.PRAYER_OF_MENDING_CAST.id,
  SPELLS.PRAYER_OF_HEALING.id,
  SPELLS.RENEW.id,
  SPELLS.HOLY_WORD_SERENITY.id,
  SPELLS.HOLY_WORD_SANCTIFY.id,
  SPELLS.LIGHT_OF_TUURE_TRAIT.id,
  SPELLS.BINDING_HEAL_TALENT.id,
  SPELLS.CIRCLE_OF_HEALING_TALENT.id,
  SPELLS.HALO_TALENT.id,
  SPELLS.DIVINE_STAR_TALENT.id,
];

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = HEALING_ABILITIES_ON_GCD;
  static ABILITIES_ON_GCD = [
    ...HEALING_ABILITIES_ON_GCD,
    SPELLS.FADE.id,
    SPELLS.ANGELIC_FEATHER_TALENT.id,
    SPELLS.BODY_AND_MIND_TALENT.id,
    SPELLS.SMITE.id,
    SPELLS.GUARDIAN_SPIRIT.id,
    SPELLS.DISPEL_MAGIC.id,
    SPELLS.LEAP_OF_FAITH.id,
    SPELLS.PURIFY.id,

    // DPS abilities that likely have no reason to be stored in SPELLS
    14915, // Holy Fire
    88625, // Holy Word: Chastise
    132157, // Holy Nova
  ];

  on_initialized() {
    super.on_initialized();

    const combatant = this.owner.modules.combatants.selected;
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
    //this.verifyCast(begincast, cast, globalCooldown);
  }
  // verifyCast(begincast, cast, globalCooldown) {
  //   if (cast.ability.guid !== SPELLS.FLASH_OF_LIGHT.id) {
  //     return;
  //   }
  //   const castTime = cast.timestamp - begincast.timestamp;
  //   if (!this.constructor.inRange(castTime, globalCooldown, 50)) { // cast times seem to fluctuate by 50ms, not sure if it depends on player latency, in that case it could be a lot more flexible
  //     console.warn(`Expected Flash of Light cast time (${castTime}) to match GCD (${Math.round(globalCooldown)}) @${cast.timestamp - this.owner.fight.start_time}`);
  //   }
  // }
  //
  //   countsAsHealingAbility(cast) {
  //   const spellId = cast.ability.guid;
  //   if (spellId === SPELLS.HOLY_SHOCK_CAST.id && !cast.targetIsFriendly) {
  //     debug && console.log(`%cABC: ${cast.ability.name} (${spellId}) skipped for healing time; target is not friendly`, 'color: orange');
  //     return false;
  //   }
  //   return super.countsAsHealingAbility(cast);
  // }

  // static inRange(num1, goal, buffer) {
  //   return num1 > (goal - buffer) && num1 < (goal + buffer);
  // }
}

export default AlwaysBeCasting;
