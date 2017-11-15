import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';
import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import DemoPets from '../WarlockCore/Pets';

const SUMMON_COOLDOWN = 90;

const GRIMOIRE_IDS = [
  SPELLS.GRIMOIRE_FELGUARD.id,
  // usually useless but for the sake of completeness
  SPELLS.GRIMOIRE_IMP.id,
  SPELLS.GRIMOIRE_VOIDWALKER.id,
  SPELLS.GRIMOIRE_FELHUNTER.id,
  SPELLS.GRIMOIRE_SUCCUBUS.id,
];

class GrimoireOfService extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    demoPets: DemoPets,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id);
  }

  suggestions(when) {
    const maxCasts = Math.ceil(calculateMaxCasts(SUMMON_COOLDOWN, this.owner.fightDuration));
    const actualCasts = GRIMOIRE_IDS.map(id => this.abilityTracker.getAbility(id).casts || 0).reduce((total, casts) => total + casts, 0);
    const percentage = actualCasts / maxCasts;
    when(percentage).isLessThan(0.9)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You should use <SpellLink id={SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id} /> more often, preferably on <SpellLink id={SPELLS.GRIMOIRE_FELGUARD.id} />.</span>)
          .icon(SPELLS.GRIMOIRE_OF_SERVICE_TALENT.icon)
          .actual(`${actualCasts} out of ${maxCasts} (${formatPercentage(actual)} %) Grimoire of Service casts.`)
          .recommended(`> ${formatPercentage(recommended)} % is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.2);
      });
  }

  statistic() {
    // TODO: Add other Grimoire pets (but realistically this is enough)
    const grimoireFelguardDamage = this.demoPets.getTotalPetDamage(PETS.GRIMOIRE_FELGUARD.id);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id} />}
        value={`${formatNumber(grimoireFelguardDamage / this.owner.fightDuration * 1000)} DPS`}
        label="Grimoire of Service damage"
        tooltip={`Your Grimoire of Service: Felguard did ${formatNumber(grimoireFelguardDamage)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(grimoireFelguardDamage))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(3);
}

export default GrimoireOfService;
