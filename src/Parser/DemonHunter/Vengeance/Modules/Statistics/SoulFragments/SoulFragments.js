import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class SoulFragments extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  }

  generated = 0;
  wasted = 0;
  spent = 0;
  actual = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SOUL_FRAGMENT.id) {
      this.generated += 1;
      if (this.actual < 5) {
        this.actual += 1;
      } else {
        this.wasted += 1;
      }
    }
  }

  on_byPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SOUL_FRAGMENT_STACK.id) {
      this.spent += 1;
      this.actual -= 1;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SOUL_FRAGMENT_STACK.id) {
      this.spent += 1;
      this.actual -= 1;
    }
  }

  suggestions(when) {
    const wasterPerGenerated = this.wasted / this.generated;
    const maximumWaste = Math.floor(0.15 * this.generated);

    when(wasterPerGenerated).isGreaterThan(0.15)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>You are wasting <SpellLink id={SPELLS.SOUL_FRAGMENT.id} />. Try to not let them cap by using <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> and/or <SpellLink id={SPELLS.SOUL_CLEAVE.id} /> to spend it. The only moment you should let them cap is when you are waiting to use <SpellLink id={SPELLS.SOUL_BARRIER_TALENT.id} /> to mitigate heavy incoming damage. </React.Fragment>)
        .icon('spell_shadow_soulgem')
        .actual(`${formatNumber(this.wasted)} wasted Soul Fragments.`)
        .recommended(`<=${formatNumber(maximumWaste)} is recommended`)
        .regular(recommended + 0.03)
        .major(recommended + 0.05);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_FRAGMENT.id} />}
        value={`${formatNumber(this.wasted)}`}
        label="Soul Fragments wasted"
        tooltip={`The total Soul Fragments generated was ${formatNumber(this.generated)}.<br/>The total Soul Fragments spent was ${formatNumber(this.spent)}.<br/>The total Soul Fragments wasted was ${formatNumber(this.wasted)}.<br/>At the end of the fight, you had ${formatNumber(this.actual)} unused Soul Fragments.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default SoulFragments;
