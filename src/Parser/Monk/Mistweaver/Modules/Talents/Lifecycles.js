import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

const baseMana = 1100000;

class Lifecycles extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  manaSaved = 0;
  manaSavedViv = 0;
  manaSavedEnm = 0;
  castsRedEnm = 0;
  castsRedViv = 0;
  castsNonRedViv = 0;
  castsNonRedEnm = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.LIFECYCLES_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    // Checking to ensure player has cast Vivify and has the mana reduction buff.
    if (spellId === SPELLS.VIVIFY.id && this.combatants.selected.hasBuff(SPELLS.LIFECYCLES_VIVIFY_BUFF.id)) {
      this.manaSaved += (baseMana * SPELLS.VIVIFY.manaPerc) * (SPELLS.LIFECYCLES_VIVIFY_BUFF.manaPercRed);
      this.manaSavedViv += (baseMana * SPELLS.VIVIFY.manaPerc) * (SPELLS.LIFECYCLES_VIVIFY_BUFF.manaPercRed);
      this.castsRedViv += 1;
      debug && console.log('Viv Reduced');
    }
    if (spellId === SPELLS.VIVIFY.id && !this.combatants.selected.hasBuff(SPELLS.LIFECYCLES_VIVIFY_BUFF.id)) {
      this.castsNonRedViv += 1;
    }
    // Checking to ensure player has cast Enveloping Mists and has the mana reduction buff
    if (spellId === SPELLS.ENVELOPING_MISTS.id && this.combatants.selected.hasBuff(SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.id)) {
      this.manaSaved += (baseMana * SPELLS.ENVELOPING_MISTS.manaPerc) * (SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.manaPercRed);
      this.manaSavedEnm += (baseMana * SPELLS.ENVELOPING_MISTS.manaPerc) * (SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.manaPercRed);
      this.castsRedEnm += 1;
      debug && console.log('ENM Reduced');
    }
    if (spellId === SPELLS.ENVELOPING_MISTS.id && !this.combatants.selected.hasBuff(SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.id)) {
      this.castsNonRedEnm += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.manaSaved,
      isLessThan: {
        minor: 200000,
        average: 170000,
        major: 140000,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.manaSaved).isLessThan(this.suggestionThresholds.isLessThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your current spell usage is not taking full advantage of the <SpellLink id={SPELLS.LIFECYCLES_TALENT.id} /> talent. You should be trying to alternate the use of these spells as often as possible to take advantage of the buff.</span>)
          .icon(SPELLS.LIFECYCLES_TALENT.icon)
          .actual(`${formatNumber(this.manaSaved)} mana saved through Lifecycles`)
          .recommended(`${formatNumber(recommended)} is the recommended amount of mana savings`)
          .regular(this.suggestionThresholds.isLessThan.average).major(this.suggestionThresholds.isLessThan.major);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LIFECYCLES_TALENT.id} />}
        value={`${formatNumber(this.manaSaved)}`}
        label={(
          <dfn data-tip={`You saved a total of ${this.manaSaved} from the Lifecycles talent.
            <ul><li>On ${this.castsRedViv} Vivify casts, you saved ${(this.manaSavedViv / 1000).toFixed(0)}k mana. (${formatPercentage(this.castsRedViv / (this.castsRedViv + this.castsNonRedViv))}%)</li>
            <li>On ${this.castsRedEnm} Enveloping Mists casts, you saved ${(this.manaSavedEnm / 1000).toFixed(0)}k mana. (${formatPercentage(this.castsRedEnm / (this.castsRedEnm + this.castsNonRedEnm))}%)</li>
            <li>You casted ${this.castsNonRedViv} Vivify's and ${this.castsNonRedEnm} Enveloping Mists at full mana.</li>
            </ul>
            `}
          >
            Mana Saved
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(70);

  on_finished() {
    if (debug) {
      console.log(`Mana Reduced:${this.manaSaved}`);
      console.log(`Viv Mana Reduced:${this.manaSavedViv}`);
      console.log(`EnM Mana Reduced:${this.manaSavedEnm}`);
    }
  }
}

export default Lifecycles;
