import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class Sanctify extends Module {
  casts = 0
  hits = 0

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOLY_WORD_SANCTIFY.id) {
      return;
    }

    // We should consider hits of Sanctify with >80% OH to essentially be "missed" hits since they did very little
    // and likely could have been done better.
    if ((event.overheal || 0) > event.amount * 4) {
      return;
    }
    this.hits += 1;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOLY_WORD_SANCTIFY.id) {
      return;
    }
    this.casts += 1;
  }

}

export default Sanctify;
