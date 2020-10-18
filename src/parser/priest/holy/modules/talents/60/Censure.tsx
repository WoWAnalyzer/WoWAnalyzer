import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Events, { ApplyDebuffEvent, CastEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Censure extends Analyzer {
  chastiseCasts = 0;
  censureStuns = 0;
  censureIncomp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CENSURE_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_WORD_CHASTISE), this.onCast);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell([SPELLS.HOLY_WORD_CHASTISE_CENSURE_INCAPACITATE, SPELLS.HOLY_WORD_CHASTISE_CENSURE_STUN]), this.onApplyDebuff);
  }

  onCast(event: CastEvent) {
    this.chastiseCasts += 1;
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
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
      <Statistic
        tooltip={(
          <>
            {this.chastiseCasts} Chastise Casts<br />
            {this.censureStuns} Chastise Stuns<br />
          </>
        )}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(4)}
      >
        <BoringSpellValueText spell={SPELLS.CENSURE_TALENT}>
          {this.censureStuns + this.censureIncomp} Censure CC(s)
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Censure;
