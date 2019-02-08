// Modified from Original Code by Blazyb and his Innervate module.
import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import Analyzer from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import Vivify from '../spells/Vivify';
import ManaTea from './ManaTea';

class RenewingMistDuringManaTea extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    vivify: Vivify,
    manaTea: ManaTea,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MANA_TEA_TALENT.id);
  }

  get avgRemDuringMT() {
    return this.vivify.remDuringManaTea / this.manaTea.vivCasts || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgRemDuringMT,
      isLessThan: {
        minor: 2,
        average: 1.5,
        major: 1,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          During <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> you should have a minimum of two <SpellLink id={SPELLS.RENEWING_MIST.id} /> out to maximize your healing during the buff.
        </>
      )
        .icon(SPELLS.MANA_TEA_TALENT.icon)
        .actual(`${this.avgRemDuringMT.toFixed(2)} average Renewing Mists during Mana Tea`)
        .recommended(`${recommended} average Renewing Mists recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(25)}
        icon={<SpellIcon id={SPELLS.MANA_TEA_TALENT.id} />}
        value={`${this.avgRemDuringMT.toFixed(2)}`}
        label={(
          <dfn
            data-tip={`
              This is the average number of Renewing Mists active during Mana Tea
            `}
          >
            Average Renewing Mists
          </dfn>
        )}
      />
    );
  }
}

export default RenewingMistDuringManaTea;
