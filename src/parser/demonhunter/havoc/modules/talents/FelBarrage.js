import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatThousands} from 'common/format';
import SpellLink from 'common/SpellLink';

/**
 * Example Report: https://www.warcraftlogs.com/reports/Mz8cTFgNkxXaJt3j/#fight=4&source=18
 */

class FelBarrage extends Analyzer{

  damage = 0;
  casts = 0;
  badCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FEL_BARRAGE_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEL_BARRAGE_DAMAGE), this.felBarrage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FEL_BARRAGE_TALENT), this.felBarrageCasts);
  }

  felBarrage(event) {
    this.damage += event.amount;
  }

  felBarrageCasts(event) {
    this.casts += 1;

    const hasMetaBuff = this.selectedCombatant.hasBuff(SPELLS.METAMORPHOSIS_HAVOC_BUFF.id, event.timestamp);

    if (!hasMetaBuff) {
      this.badCasts += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Try to cast <SpellLink id={SPELLS.FEL_BARRAGE_TALENT.id} /> during <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} />.</>)
          .icon(SPELLS.FEL_BARRAGE_TALENT.icon)
          .actual(<>{actual} bad <SpellLink id={SPELLS.FEL_BARRAGE_TALENT.id} /> casts without <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} />.</>)
          .recommended(`No bad casts is recommended.`);
      });
  }

  statistic(){
    return (
      <TalentStatisticBox
        talent={SPELLS.FEL_BARRAGE_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={(
<>
          {this.badCasts} <small>casts without <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} /> </small> <br />
          {this.owner.formatItemDamageDone(this.damage)}
        </>
)}
        tooltip={(
          <>
          A bad cast is casting Fel Barage without Metamorphosis up.<br /><br />

          {formatThousands(this.damage)} total damage
          </>
        )}
      />
    );
  }
}
export default FelBarrage;
