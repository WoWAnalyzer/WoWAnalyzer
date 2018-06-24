import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';

class AlphaWolf extends Analyzer {

  feralSpiritCastCount = 0;
  feralSpiritCastFlag = false;
  missedAlphaWolfCount = 0;

  on_byPlayer_cast(event) {
    if(this.feralSpiritCastFlag) {
      if(event.ability.guid !== SPELLS.CRASH_LIGHTNING.id) {
        this.missedAlphaWolfCount += 1;
      }
      this.feralSpiritCastFlag = false;
    }

    if(event.ability.guid === SPELLS.FERAL_SPIRIT.id) {
      this.feralSpiritCastFlag = true;
      this.feralSpiritCastCount += 1;
    }
  }

  suggestions(when) {
    when(this.missedAlphaWolfCount).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Make sure Crash Lightning is always cast directly after Feral Spirits to activate Alpha Wolf, even on single target')
          .icon(SPELLS.ALPHA_WOLF_TRAIT.icon)
          .actual(`${actual} out of ${this.feralSpiritCastCount} missed priority casts`)
          .recommended(`${recommended} recommended`)
          .regular(recommended).major(recommended);
      });
  }
}

export default AlphaWolf;
