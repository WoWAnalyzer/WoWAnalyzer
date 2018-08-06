import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

import SoulFragmentsTracker from '../Features/SoulFragmentsTracker';

class SoulsOvercap extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    soulFragmentsTracker: SoulFragmentsTracker,
  };

  //Managing souls with spirit bomb properly leads to a dps increase. Without the talent it doesnt matter how you absorb souls.
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id);
  }

  suggestions(when) {
    const WastePercent = 0.15;
    const wasterPerGenerated = this.soulFragmentsTracker.soulsWasted / this.soulFragmentsTracker.soulsGenerated;
    const maximumWaste = Math.floor(WastePercent * this.soulFragmentsTracker.soulsGenerated);

    when(wasterPerGenerated).isGreaterThan(0.15)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>You are wasting <SpellLink id={SPELLS.SOUL_FRAGMENT.id} />. They are absorbed automatically when you overcap, your missing out on the extra damage consuming them with <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> provides.</React.Fragment>)
        .icon('spell_shadow_soulgem')
        .actual(`${formatNumber(this.soulFragmentsTracker.soulsWasted)} wasted Soul Fragments.`)
        .recommended(`<=${formatNumber(maximumWaste)} is recommended`)
        .regular(recommended + 0.03)
        .major(recommended + 0.05);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_FRAGMENT.id} />}
        value={`${formatNumber(this.soulFragmentsTracker.soulsWasted)} Souls`}
        label="Inefficiently Used"
        tooltip={`You generated ${formatNumber(this.soulFragmentsTracker.soulsWasted)} souls at cap. These are absorbed automatically <br/>
                  and aren't avalible to boost Spirit Bomb's damage.<br/>
                  Total Soul Fragments generated: ${formatNumber(this.soulFragmentsTracker.soulsGenerated)}<br/>
                  Total Soul Fragments spent: ${formatNumber(this.soulFragmentsTracker.soulsSpent)}<br/>
                  At the end of the fight, you had ${formatNumber(this.soulFragmentsTracker.currentSouls)} unused Soul Fragments.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default SoulsOvercap;
