import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

const WRATH_OF_THE_ASHBRINGER_INCREASE = 2;

/**
 * Wrath of the Ashbringer (Artifact Trait)
 * Increase the duration of Crusade/Avenging Wrath by 2 seconds.
 */
class WrathOfTheAshbringer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  wingsDamage = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.WRATH_OF_THE_ASHBRINGER.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_damage(event) {
    if (!this.combatants.selected.hasBuff(SPELLS.CRUSADE_TALENT.id)) {
      return;
    }
    if (event.targetIsFriendly) {
      return;
    }
    this.wingsDamage += (event.amount || 0) + (event.aborbed || 0);
  }

  get wingsDPS() {
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.CRUSADE_TALENT.id) / 1000;
    const averageWingsDPS = this.wingsDamage / uptime;
    //The average amount of damage gained from 2 extra seconds of wings
    return averageWingsDPS * WRATH_OF_THE_ASHBRINGER_INCREASE;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.WRATH_OF_THE_ASHBRINGER.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.wingsDPS))} %
        </div>
      </div>
    );
  }
}

export default WrathOfTheAshbringer;
