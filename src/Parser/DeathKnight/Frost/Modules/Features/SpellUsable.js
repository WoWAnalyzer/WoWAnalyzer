import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';
import GlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
//import Abilities from '../Abilities';

const RUNIC_CHILLS_COOLDOWN_REDUCTION_MS = 1000;
const ICECAP_COOLDOWN_REDUCTION_MS = 1000;

const CRYSTALLINE_SWORDS_ABILITIES = [
  SPELLS.CRYSTALLINE_SWORDS_1.id,
  SPELLS.CRYSTALLINE_SWORDS_2.id,
  SPELLS.CRYSTALLINE_SWORDS_THRONEBREAKER.id,
];

const ICECAP_ABILITIES = [
  SPELLS.OBLITERATE_MAIN_HAND_DAMAGE.id,
  SPELLS.OBLITERATE_OFF_HAND_DAMAGE.id,
  SPELLS.FROST_STRIKE_MAIN_HAND_DAMAGE.id,
  SPELLS.FROST_STRIKE_OFF_HAND_DAMAGE.id,
  SPELLS.FROSTSCYTHE_TALENT.id,
];

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    combatants: Combatants,
    globalCooldown: GlobalCooldown,
  };

  lastCritTime = -2000;

  on_initialized() {
    this.hasIcecap = this.combatants.selected.hasTalent(SPELLS.ICECAP_TALENT.id);
  }

  on_byPlayer_damage(event){
    const spellId = event.ability.guid;
    const isCrit = event.hitType === HIT_TYPES.CRIT || event.hitType === HIT_TYPES.BLOCKED_CRIT;
    const offInternalCD = (this.lastCritTime + this.globalCooldown.getCurrentGlobalCooldown(spellId)) <= event.timestamp;
    if(CRYSTALLINE_SWORDS_ABILITIES.some(id => spellId === id)){
      if(this.isOnCooldown(SPELLS.SINDRAGOSAS_FURY_ARTIFACT.id)){
        this.reduceCooldown(SPELLS.SINDRAGOSAS_FURY_ARTIFACT.id, RUNIC_CHILLS_COOLDOWN_REDUCTION_MS);
      }
    }
    if(this.hasIcecap && ICECAP_ABILITIES.some(id => spellId === id) && isCrit){     
      if(this.isOnCooldown(SPELLS.PILLAR_OF_FROST.id) && offInternalCD){
        this.reduceCooldown(SPELLS.PILLAR_OF_FROST.id, ICECAP_COOLDOWN_REDUCTION_MS);
        this.lastCritTime = event.timestamp;
      }
    }    
  }

  beginCooldown(spellId, timestamp) {
    if (this.hasIcecap && spellId === SPELLS.PILLAR_OF_FROST.id) {
      if (!this.isAvailable(spellId)) {
        this.endCooldown(spellId);
      }
    }

    super.beginCooldown(spellId, timestamp);
  }
}

export default SpellUsable;
