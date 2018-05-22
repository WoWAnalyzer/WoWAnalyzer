import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';

// dependencies
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

class LightOfTuure extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  _lotTargets = {};
  buffHealing = 0;
  spellHealing = 0;

  on_initialized() {
    this.lotTraits = this.combatants.selected.traitsBySpellId[SPELLS.CARESS_OF_THE_NAARU_TRAIT.id] || 0;
    this.lotModifier = 0.25 + (0.05 * this.lotTraits);
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.LIGHT_OF_TUURE_TRAIT.id] > 0;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LIGHT_OF_TUURE_TRAIT.id) {
      this._lotTargets[event.targetID] = event.timestamp + (SPELLS.LIGHT_OF_TUURE_TRAIT.duration * 1000);
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LIGHT_OF_TUURE_TRAIT.id) {
      this._lotTargets[event.targetID] = event.timestamp + (SPELLS.LIGHT_OF_TUURE_TRAIT.duration * 1000);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LIGHT_OF_TUURE_TRAIT.id) {
      this.spellHealing += event.amount;
    }

    if (event.targetID in this._lotTargets && event.timestamp < this._lotTargets[event.targetID]) {
      if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
        return;
      }

      this.buffHealing += calculateEffectiveHealing(event, this.lotModifier);
    }
  }

  statistic() {
    const lotSpellHealing = formatNumber(this.spellHealing);
    const lotBuffHealing = formatNumber(this.buffHealing);
    const lotTotal = this.spellHealing + this.buffHealing;
    const lotPercHPS = formatPercentage(this.owner.getPercentageOfTotalHealingDone(lotTotal));
    const lotHPS = formatNumber(lotTotal / this.owner.fightDuration * 1000);

    //
    return this.active && (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LIGHT_OF_TUURE_TRAIT.id} />}
        value={`${formatNumber(lotTotal)}`}
        label={(
          <dfn data-tip={`The benefit from both Light of T'uure casts and additional casts on targets with the buff. ${lotSpellHealing} from the spell itself and ${lotBuffHealing} from the buff it provides. This was ${lotPercHPS}% / ${lotHPS} of your total healing.`}>
            Light of Tuure
          </dfn>
        )}
      />
    );
    //
  }

  statisticOrder = STATISTIC_ORDER.UNIMPORTANT(1);
}


export default LightOfTuure;
