import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import CoreAlwaysBeCastingHealing from 'Parser/Core/Modules/AlwaysBeCastingHealing';

const debug = true;

const HEALING_ABILITIES_ON_GCD = [
  SPELLS.FLASH_OF_LIGHT.id,
  SPELLS.HOLY_LIGHT.id,
  SPELLS.HOLY_SHOCK_CAST.id,
  // ABILITIES.JUDGMENT_CAST.id, // Only with either JoL or Ilterendi
  SPELLS.LIGHT_OF_DAWN_CAST.id,
  SPELLS.LIGHT_OF_THE_MARTYR.id,
  SPELLS.BESTOW_FAITH_TALENT.id,
  SPELLS.TYRS_DELIVERANCE_CAST.id,
  SPELLS.HOLY_PRISM_CAST.id,
  SPELLS.LIGHTS_HAMMER_TALENT.id,
  // ABILITIES.CRUSADER_STRIKE.id, // Only with Crusader's Might, is added in on_byPlayer_combatantinfo if applicable
];

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = HEALING_ABILITIES_ON_GCD;
  static ABILITIES_ON_GCD = [
    ...HEALING_ABILITIES_ON_GCD,
    SPELLS.JUDGMENT_CAST.id,
    SPELLS.CRUSADER_STRIKE.id,
    225141, // http://www.wowhead.com/spell=225141/fel-crazed-rage (Draught of Souls)
    SPELLS.DIVINE_STEED.id,
    26573, // Consecration
    SPELLS.BLINDING_LIGHT_TALENT.id,
    642, // Divine Shield
    SPELLS.LAY_ON_HANDS.id,
    SPELLS.BEACON_OF_FAITH_TALENT.id,
    SPELLS.BEACON_OF_THE_LIGHTBRINGER_TALENT.id, // pretty sure this will be the logged cast when BotLB is reapplied, not the below "Beacon of Light" which is the buff. Not yet tested so leaving both in.
    53563, // Beacon of Light
    SPELLS.BEACON_OF_VIRTUE_TALENT.id,
    SPELLS.BLESSING_OF_FREEDOM.id,
    1022, // Blessing of Protection
    4987, // Cleanse
    853, // Hammer of Justice
    SPELLS.HAND_OF_RECKONING.id,
  ];

  on_initialized(event) {
    super.on_initialized(arguments);

    const combatant = this.owner.modules.combatants.selected;

    if (combatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id)) {
      this.constructor.HEALING_ABILITIES_ON_GCD.push(SPELLS.CRUSADER_STRIKE.id);
    }
    if (combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id) || combatant.hasRing(ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id)) {
      this.constructor.HEALING_ABILITIES_ON_GCD.push(SPELLS.JUDGMENT_CAST.id);
    }
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
    this.verifyCast(begincast, cast, globalCooldown);
  }
  verifyCast(begincast, cast, globalCooldown) {
    if (cast.ability.guid !== SPELLS.FLASH_OF_LIGHT.id) {
      return;
    }
    const castTime = cast.timestamp - begincast.timestamp;
    if (!this.constructor.inRange(castTime, globalCooldown, 50)) { // cast times seem to fluctuate by 50ms, not sure if it depends on player latency, in that case it could be a lot more flexible
      console.warn(`Expected Flash of Light cast time (${castTime}) to match GCD (${Math.round(globalCooldown)}) @${cast.timestamp - this.owner.fight.start_time}`);
    }
  }

    countsAsHealingAbility(cast) {
    const spellId = cast.ability.guid;
    if (spellId === SPELLS.HOLY_SHOCK_CAST.id && !cast.targetIsFriendly) {
      debug && console.log(`%cABC: ${cast.ability.name} (${spellId}) skipped for healing time; target is not friendly`, 'color: orange');
      return false;
    }
    return super.countsAsHealingAbility(cast);
  }

  static inRange(num1, goal, buffer) {
    return num1 > (goal - buffer) && num1 < (goal + buffer);
  }
}

export default AlwaysBeCasting;
