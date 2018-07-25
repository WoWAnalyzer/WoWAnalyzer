import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class SoulFragments extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  //Managing souls with spirit bomb properly leads to a dps increase. Without the talent it doesnt matter how you absorb souls.
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id);
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
        value={`${formatNumber(this.wasted)} Soul Fragments`}
        label="Inefficiently Used"
        tooltip={`You generated ${formatNumber(this.wasted)} souls at cap. These are absorbed automatically <br/>
                  and aren't avalible to boost Spirit Bomb's damage.<br/>
                  Total Soul Fragments generated: ${formatNumber(this.generated)}<br/>
                  Total Soul Fragments spent: ${formatNumber(this.spent)}<br/>
                  At the end of the fight, you had ${formatNumber(this.actual)} unused Soul Fragments.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default SoulFragments;
