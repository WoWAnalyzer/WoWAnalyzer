import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

class PrayerOfMending extends Analyzer {
  totalPoMHealing = 0;
  totalPoMOverhealing = 0;
  pomCasts = 0;
  salvCasts = 0;
  pomHealTicks = 0;
  pomBuffCount = 0;
  pomRemovalCount = 0;
  prepullPomBuffs = 0;
  lastSalvCastTime = 0;

  get pomTicksFromSalv() {
    if (this.salvCasts === 0) {
      return 0;
    }
    const estSalvPoms = this.pomBuffCount - this.pomTicksFromCast - (this.prepullPomBuffs * 10);
    return estSalvPoms;
  }

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

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PRAYER_OF_MENDING_CAST.id) {
      this.pomCasts++;
    }
    if (spellId === SPELLS.HOLY_WORD_SALVATION_TALENT.id) {
      this.lastSalvCastTime = event.timestamp;
      this.salvCasts++;
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
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PRAYER_OF_MENDING_BUFF.id) {
      if (event.prepull) {
        this.prepullPomBuffs++;
        this.pomCasts++;
      }
    }
  }

  on_byPlayer_changebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PRAYER_OF_MENDING_BUFF.id) {
      if (event.stacksGained > 0) {
        this.pomBuffCount++;
      } else {
        this.pomRemovalCount++;
      }
    }
  }
}

export default PrayerOfMending;
