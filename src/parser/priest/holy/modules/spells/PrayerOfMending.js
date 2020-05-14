import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

class PrayerOfMending extends Analyzer {
  totalPoMHealing = 0;
  totalPoMOverhealing = 0;
  totalPoMAbsorption = 0;
  pomCasts = 0;
  salvCasts = 0;
  pomHealTicks = 0;
  pomBuffCount = 0;
  pomRemovalCount = 0;
  prepullPomBuffs = 0;
  lastSalvCastTime = 0;
  pomTicksFromSalv = 0;

  get pomTicksFromCast() {
    return this.pomCasts * 5;
  }

  get wastedPomStacks() {
    return this.pomBuffCount - this.pomHealTicks;
  }

  get averagePomTickHeal() {
    return this.totalPoMHealing / this.pomHealTicks;
  }

  get averagePomTickOverheal() {
    return this.totalPoMOverhealing / this.pomHealTicks;
  }

  get averagePomTickAbsorption() {
    return this.totalPoMAbsorption / this.pomHealTicks;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PRAYER_OF_MENDING_CAST.id) {
      this.pomCasts += 1;
    }
    if (spellId === SPELLS.HOLY_WORD_SALVATION_TALENT.id) {
      this.lastSalvCastTime = event.timestamp;
      this.salvCasts += 1;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PRAYER_OF_MENDING_HEAL.id) {
      this.pomHealTicks += 1;
      this.totalPoMHealing += event.amount || 0;
      this.totalPoMOverhealing += event.overheal || 0;
      this.totalPoMAbsorption += event.absorbed || 0;
    }
    if (spellId === SPELLS.HOLY_WORD_SALVATION_TALENT.id) {
      this.pomTicksFromSalv += 2;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PRAYER_OF_MENDING_BUFF.id) {
      if (event.prepull) {
        this.prepullPomBuffs += 1;
        this.pomCasts += 1;
      }
    }
  }

  on_byPlayer_changebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PRAYER_OF_MENDING_BUFF.id) {
      if (event.stacksGained > 0) {
        this.pomBuffCount += 1;
      } else {
        this.pomRemovalCount += 1;
      }
    }
  }
}

export default PrayerOfMending;
