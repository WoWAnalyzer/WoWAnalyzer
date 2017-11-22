import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

const SUMMON_COOLDOWN = 90;

const GRIMOIRE_IDS = [
  SPELLS.GRIMOIRE_IMP.id,
  // usually useless but for the sake of completeness
  SPELLS.GRIMOIRE_VOIDWALKER.id,
  SPELLS.GRIMOIRE_FELHUNTER.id,
  SPELLS.GRIMOIRE_SUCCUBUS.id,
];

class GrimoireOfService extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
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
        return suggest(<span>You should use <SpellLink id={SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id} /> more often, preferably on <SpellLink id={SPELLS.GRIMOIRE_IMP.id} />.</span>)
          .icon(SPELLS.GRIMOIRE_OF_SERVICE_TALENT.icon)
          .actual(`${actualCasts} out of ${maxCasts} (${formatPercentage(actual)} %) Grimoire of Service casts.`)
          .recommended(`> ${formatPercentage(recommended)} % is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.2);
      });
  }
}
export default GrimoireOfService;
