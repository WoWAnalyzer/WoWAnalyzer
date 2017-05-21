import Module from 'Parser/Core/Module';
import { LIFEBLOOM_BLOOM_HEAL_SPELL_ID, LIFEBLOOM_HOT_HEAL_SPELL_ID} from '../../Constants';

export const DARK_TITAN_ADVICE_ITEM_ID = 137078;
const DARK_TITAN_FINAL_HEALING_INCREASE = 3;

class DarkTitanAdvice extends Module {
  healing = 0;
  lastRealBloomTimestamp = null;
  healingFromProccs = 0;
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === LIFEBLOOM_BLOOM_HEAL_SPELL_ID) {
      // Add 100% of the bloom if it came from the random 3% procc
      // Let's give it 32 ms tolerence for kicks.
      if(this.lastRealBloomTimestamp !== null && Math.abs(event.timestamp - this.lastRealBloomTimestamp) < 32) {
        this.healing += event.amount;
        this.healingFromProccs += event.amount;
      } else {
        this.healing += (event.amount - (event.amount / DARK_TITAN_FINAL_HEALING_INCREASE));
      }

      return;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if (spellId === LIFEBLOOM_HOT_HEAL_SPELL_ID) {
      this.lastRealBloomTimestamp = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === LIFEBLOOM_HOT_HEAL_SPELL_ID) {
      this.lastRealBloomTimestamp = event.timestamp;
    }
  }
}

export default DarkTitanAdvice;
