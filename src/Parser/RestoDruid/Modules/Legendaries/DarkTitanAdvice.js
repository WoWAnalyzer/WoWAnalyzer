import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

export const DARK_TITAN_ADVICE_ITEM_ID = 137078;
const DARK_TITAN_FINAL_HEALING_INCREASE = 3;

class DarkTitanAdvice extends Module {
  healing = 0;
  lastRealBloomTimestamp = null;
  healingFromProccs = 0;
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.LIFEBLOOM_BLOOM_HEAL.id) {
      // Add 100% of the bloom if it came from the random 3% procc
      // Let's give it 32 ms tolerence for kicks.
      if (this.lastRealBloomTimestamp !== null && (event.timestamp - this.lastRealBloomTimestamp) < 32) {
        this.healing += event.amount;
        this.healingFromProccs += event.amount;
      } else {
        const baseHeal = (event.amount + event.overheal||0)/DARK_TITAN_FINAL_HEALING_INCREASE;
        this.healing += Math.max(0, event.amount - baseHeal);
      }

      return;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.LIFEBLOOM_HOT_HEAL.id) {
      this.lastRealBloomTimestamp = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.LIFEBLOOM_HOT_HEAL.id) {
      this.lastRealBloomTimestamp = event.timestamp;
    }
  }
}

export default DarkTitanAdvice;
