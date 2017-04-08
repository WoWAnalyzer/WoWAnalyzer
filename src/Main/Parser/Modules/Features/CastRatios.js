import Module from 'Main/Parser/Module';
import { HOLY_SHOCK_HEAL_SPELL_ID, FLASH_OF_LIGHT_SPELL_ID, HOLY_LIGHT_SPELL_ID, LIGHT_OF_THE_MARTYR_SPELL_ID, HIT_TYPES, T19_4SET_BONUS_BUFF_ID } from 'Main/Parser/Constants';

const INFUSION_OF_LIGHT_SPELL_ID = 54149;
const INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER = 50; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.

class BeaconHealing extends Module {
  casts = {
    flashOfLight: 0,
    holyLight: 0,
    flashOfLightWithIol: 0,
    holyLightWithIol: 0,
    flashOfLightOnBeacon: 0,
    holyLightOnBeacon: 0,
    lightOfTheMartyr: 0,
    holyShock: 0,
    holyShockCriticals: 0,
  };

  on_heal(event) {
    if (this.owner.byPlayer(event)) {
      this.processForCastRatios(event);
    }
  }

  processForCastRatios(event) {
    const spellId = event.ability.guid;

    if (spellId === HOLY_SHOCK_HEAL_SPELL_ID) {
      this.casts.holyShock += 1;
      if (event.hitType === HIT_TYPES.CRIT) {
        this.casts.holyShockCriticals += 1;
      }
    } else if (spellId === FLASH_OF_LIGHT_SPELL_ID || spellId === HOLY_LIGHT_SPELL_ID) {
      const hasIol = this.owner.modules.buffs.hasBuff(INFUSION_OF_LIGHT_SPELL_ID, INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER);
      // TODO: target hasBeaconOfLight

      switch (spellId) {
        case FLASH_OF_LIGHT_SPELL_ID:
          this.casts.flashOfLight += 1;
          if (hasIol) {
            this.casts.flashOfLightWithIol += 1;
          }
          break;
        case HOLY_LIGHT_SPELL_ID:
          this.casts.holyLight += 1;
          if (hasIol) {
            this.casts.holyLightWithIol += 1;
          }
          break;
        default: break;
      }
    } else if (spellId === LIGHT_OF_THE_MARTYR_SPELL_ID) {
      this.casts.lightOfTheMartyr += 1;
    }
  }
  get iolProcsPerHolyShockCrit() {
    return this.owner.modules.buffs.hasBuff(T19_4SET_BONUS_BUFF_ID) ? 2 : 1;
  }
}

export default BeaconHealing;
