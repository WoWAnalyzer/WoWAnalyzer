import Module from 'Main/Parser/Module';
import { FLASH_OF_LIGHT_SPELL_ID, HOLY_LIGHT_SPELL_ID, HIT_TYPES } from 'Main/Parser/Constants';

const INFUSION_OF_LIGHT_SPELL_ID = 54149;
const INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER = 50; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.

class CastCounter extends Module {
  casts = {};

  on_byPlayer_cast(event) {
    this.registerCast(event);
  }

  on_byPlayer_heal(event) {
    this.registerHit(event);
  }

  registerCast(event) {
    const cast = this._getCastFromAbility(event.ability);
    cast.casts = (cast.casts || 0) + 1;
  }
  registerHit(event) {
    const spellId = event.ability.guid;
    const cast = this._getCastFromAbility(event.ability);
    cast.hits = (cast.hits || 0) + 1;
    const isCrit = event.hitType === HIT_TYPES.CRIT;
    if (isCrit) {
      cast.crits = (cast.crits || 0) + 1;
    }

    if (spellId === FLASH_OF_LIGHT_SPELL_ID || spellId === HOLY_LIGHT_SPELL_ID) {
      const hasIol = this.owner.selectedCombatant.hasBuff(INFUSION_OF_LIGHT_SPELL_ID, INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER);

      if (hasIol) {
        cast.withIol = (cast.withIol || 0) + 1;
      }
    }

    const hasBeacon = this.owner.modules.beaconTargets.hasBeacon(event.targetID);
    if (hasBeacon) {
      cast.withBeacon = (cast.withBeacon || 0) + 1;
    }
  }

  _getCastFromAbility(ability) {
    const spellId = ability.guid;
    let cast = this.casts[spellId];
    if (!cast) {
      cast = {
        ability,
      };
      this.casts[spellId] = cast;
    }
    return cast;
  }
}


export default CastCounter;
