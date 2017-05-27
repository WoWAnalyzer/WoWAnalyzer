import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCastingHealing from 'Parser/Core/Modules/AlwaysBeCastingHealing';

const debug = true;

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
