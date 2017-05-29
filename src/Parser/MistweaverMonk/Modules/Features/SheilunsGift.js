import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = false;

class SheilunsGift extends Module {
  stacksSG = 0;
  stacksTotalSG = 0;
  castsSG = 0;
  sgHeal = 0;
  overhealSG = 0;
  stacksWastedSG = 0;
  lastSGStack = null;
  diffLastSGStack = null;
  castsSGTimestamp = null;

  whispersHeal = 0;
  whispersOverHeal = 0;
  countWhispersHeal = 0;
  countEff = 0;

  hasEffusiveMists = 0;

  on_initialize() {
    this.hasEffusiveMists = this.owner.selectedCombatant.traitsBySpellId[SPELLS.EFFUSIVE_MISTS.id] === 1;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.SHEILUNS_GIFT_BUFF.id) {
      this.stacksSG++;
      debug && console.log('SG stacks at ' + this.stacksSG);
    }
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.SHEILUNS_GIFT_BUFF.id) {
      this.stacksSG++;
      this.lastSGStack = event.timestamp;
      debug && console.log('SG stacks at ' + this.stacksSG + '  Timestamp: ' + event.timestamp);
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.SHEILUNS_GIFT_BUFF.id) {
      debug && console.log('SG stacks at ' + this.stacksSG);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.EFFUSE.id) {
      this.countEff++;
    }

    if(spellId === SPELLS.SHEILUNS_GIFT.id) {
      this.castsSG++;
      this.stacksTotalSG += this.stacksSG;
      this.stacksSG = 0;
      this.diffLastSGStack = event.timestamp - this.lastSGStack;
      this.castsSGTimestamp = event.timestamp;
      debug && console.log('SG Cast at ' + this.stacksSG + ' / Timestamp: ' + event.timestamp);
      debug && console.log('Time Since Last SG Stack: ' + this.diffLastSGStack);
      if (this.diffLastSGStack > 10000) {
        this.stacksWastedSG += Math.floor(this.diffLastSGStack / 10000)
        debug && console.log('SG Capped');
      }
    }
    if(spellId === SPELLS.EFFUSE.ID && this.hasEffusiveMists && this.stacksSG === 12) {
      this.stacksWastedSG++;
      debug && console.log('Effuse Cast at Capped SG');
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.SHEILUNS_GIFT.id) {
      this.sgHeal += event.amount;
      if(event.overheal) {
        this.overhealSG += event.overheal;
      }
      debug && console.log('SG Overheal: ' + event.overheal);
    }

    if(spellId === SPELLS.WHISPERS_OF_SHAOHAO.id && event.timestamp === this.castsSGTimestamp) {
      this.whispersHeal += event.amount;
      if(event.overheal) {
        this.whispersOverHeal += event.overheal;
      }
      this.countWhispersHeal++;
      debug && console.log('Whispers Heal: ' + event.amount + ' / Whispers Overheal: ' + event.overheal);
    }
  }

  on_finished() {
    if(debug) {
      console.log("Total SG Stacks:" + this.stacksTotalSG);
      console.log("SG Casts: " + this.castsSG);
      console.log("Ending SG Stacks: " + this.stacksSG);
      console.log("SG Stacks Wasted: " + this.stacksWastedSG);
      console.log("SG Overheal Total: " + this.overhealSG + "  Avg SG Overheal: " + (this.overhealSG / this.castsSG));
    }
  }
}

export default SheilunsGift;
