import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

class PrayerOfMending extends Analyzer {
  totalPoMHealing = 0;
  totalPoMOverhealing = 0;

  pomCasts = 0;
  pomHealTicks = 0;
  pomBuffCount = 0;

  lastSalvCastTime = 0;
  pomsFromSalv = 0;

  stackTracker = {};

  get wastedPomStacks() {
    return this.pomBuffCount - this.pomHealTicks;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PRAYER_OF_MENDING_CAST.id) {
      this.pomCasts++;
    }
    if (spellId === SPELLS.HOLY_WORD_SALVATION_TALENT) {
      this.lastSalvCastTime = event.timestamp;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PRAYER_OF_MENDING_HEAL.id) {
      this.pomHealTicks++;
      this.totalPoMHealing += event.amount || 0;
      this.totalPoMOverhealing += event.overheal || 0;
    }
  }

  on_byPlayer_applybuff(event) {

  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PRAYER_OF_MENDING_BUFF.id) {
      console.log("Remove buff");
      this.handleStack(event.targetID, 0);
    }
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PRAYER_OF_MENDING_BUFF.id) {
      console.log("Apply Buff Stack " + event.stack);
      this.handleStack(event.targetID, event.stack);
    }
  }

  on_byPlayer_changebuffstack(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PRAYER_OF_MENDING_BUFF.id) {
      console.log("Change Buff Stack " + event.newStacks);
      console.log(event);
      this.handleStack(event.targetID, event.stack, event.oldStacks);
    }
  }

  on_byPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PRAYER_OF_MENDING_BUFF.id) {
      console.log("Remove Buff Stack " + event.stack);
      this.handleStack(event.targetID, 0);
    }
  }

  handleStack(targetId, newStack, eventOldStacks) {
    const oldStack = this.stackTracker[targetId] || 0;
    if (eventOldStacks &&oldStack !== eventOldStacks) {

    }
    console.log(`${targetId} stacks changed from ${oldStack} to ${newStack}`);
    this.stackTracker[targetId] = newStack;
  }
}

export default PrayerOfMending;
