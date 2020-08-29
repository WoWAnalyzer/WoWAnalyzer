import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import React from 'react';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Censure extends Analyzer {
  chastiseCasts = 0;
  censureStuns = 0;
  censureIncomp = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CENSURE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HOLY_WORD_CHASTISE.id) {
      this.chastiseCasts += 1;
    }
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HOLY_WORD_CHASTISE_CENSURE_INCAPACITATE.id) {
      this.censureIncomp += 1;
    }
    if (spellId === SPELLS.HOLY_WORD_CHASTISE_CENSURE_STUN.id) {
      this.censureStuns += 1;
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.CENSURE_TALENT.id}
        value={`${this.censureStuns + this.censureIncomp} Censure CC(s)`}
        tooltip={(
          <>
            {this.chastiseCasts} Chastise Casts<br />
            {this.censureStuns} Chastise Stuns<br />
          </>
        )}
        position={STATISTIC_ORDER.CORE(4)}
      />

    );
  }
}

export default Censure;
