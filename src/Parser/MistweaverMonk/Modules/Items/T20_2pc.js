import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';

const debug = false;

const BASEMANA = 1100000;
const TWOPC_MANA_REDUCTION = .75;

class T20_2pc extends Module {
  manaSaved = 0;
  casts = 0;
  procs = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasBuff(SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.ENVELOPING_MISTS.id) {
      return;
    }
    if(this.owner.selectedCombatant.hasBuff(SPELLS.SURGE_OF_MISTS.id, event.timestamp)) {
      this.casts++;
      this.manaSaved += (BASEMANA * SPELLS.ENVELOPING_MISTS.manaPerc) * TWOPC_MANA_REDUCTION;
    }
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.SURGE_OF_MISTS.id) {
      return;
    }
    this.procs++;
  }

  on_toPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.SURGE_OF_MISTS.id) {
      return;
    }
    this.procs++;
  }

  on_finished() {
    if(debug) {
      console.log('T20 2pc Procs: ', this.procs);
      console.log('T20 2pc Casts: ', this.casts);
      console.log('T20 2pc Mana Saved: ', this.manaSaved);
    }
  }
  /*
  if(this.modules.t20_2pc.active && (this.modules.t20_2pc.procs - this.modules.t20_2pc.casts) > 0) {
    results.addIssue({
      issue: <span>You missed {this.modules.t20_2pc.procs - this.modules.t20_2pc.casts} <SpellLink id={SPELLS.SURGE_OF_MISTS.id} /> procs. This proc provides not only a large mana savings on <SpellLink id={SPELLS.ENVELOPING_MISTS.id} />. If you have the Tier 20 4 piece bonus, you also gain a 12% healing buff through <SpellLink id={SPELLS.DANCE_OF_MISTS.id} /> </span>,
      icon: SPELLS.SURGE_OF_MISTS.icon,
      importance: getIssueImportance((this.modules.t20_2pc.procs - this.modules.t20_2pc.casts), 0, 1, true),
    });
  }
*/
  suggestions(when) {
    const missed2pcProcs = this.procs - this.casts;
    when(missed2pcProcs).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You missed a <SpellLink id={SPELLS.SURGE_OF_MISTS.id} /> proc. This proc provides not only a large mana savings on <SpellLink id={SPELLS.ENVELOPING_MISTS.id} /> but also if you have the Tier 20 4 piece bonus, you also gain a 12% healing buff through <SpellLink id={SPELLS.DANCE_OF_MISTS.id} /></span>)
          .icon(SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF.icon)
          .actual(`${missed2pcProcs} missed Surge of Mists procs`)
          .recommended(`${recommended} missed procs is recommended`)
          .regular(recommended - 3).major(recommended - 5);
      });
  }

  item() {
    return {
      id: `spell-${SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF.id} />,
      title: <SpellLink id={SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF.id} />,
      result: (
        <dfn data-tip={`The actual mana saved by the Tier 20 2 piece effect.`}>
          {formatNumber(this.manaSaved)} mana saved ({formatNumber((this.manaSaved / this.owner.fightDuration * 1000 * 5))} MP5)
        </dfn>
      ),
    };
  }
}

export default T20_2pc;
