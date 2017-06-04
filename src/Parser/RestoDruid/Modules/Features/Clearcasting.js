import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const CLEARCASTING_DURATION = 15000;
const debug = false;

// Doesn't support MoC right now.
class Clearcasting extends Module {
  total = 0;
  lastCCTimestamp = 0;
  nonCCRegrowths = 0;
  used = 0;
  lastRegrowthTimestamp = 0;
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.CLEARCASTING_BUFF.id !== spellId) {
      return;
    }
    // Get the applied timestamp
    this.lastCCTimestamp = event.timestamp;
    debug && console.log("CC was applied");
    this.total++;
  }
  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.CLEARCASTING_BUFF.id !== spellId) {
      return;
    }
    // Get the applied timestamp
    this.lastCCTimestamp = event.timestamp;
    debug && console.log("CC was refreshed");
    this.total++;
  }
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (SPELLS.REGROWTH.id !== spellId) {
      return;
    }
    if(event.tick === true) {
      return;
    }

    // Check for regrowths used without a clearcasting procc
    if(this.lastRegrowthTimestamp !== event.timestamp) {
      if(this.lastCCTimestamp == null) {
        // We got no CC buff up
        this.nonCCRegrowths++;
        return;
      }
      const clearcastingTimeframe = this.lastCCTimestamp + CLEARCASTING_DURATION;
      if (event.timestamp > clearcastingTimeframe) {
        this.nonCCRegrowths++;
      } else {
        this.used++;
        // Reset
        this.lastCCTimestamp = null;
      }
    }
    // We need this parameter to check against double regrowths applications
    // when you cast a regrowth with power of the druid buff up.
    this.lastRegrowthTimestamp = event.timestamp;
  }
}

export default Clearcasting;
