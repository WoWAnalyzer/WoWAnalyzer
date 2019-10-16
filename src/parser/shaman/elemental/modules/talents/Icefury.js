import SPELLS from 'common/SPELLS';

import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import Analyzer from 'parser/core/Analyzer';

class Icefury extends Analyzer {
    static dependencies = {
        abilityTracker: AbilityTracker,
    };

  icefuryCasts = 0;
  empoweredFrostShockCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ICEFURY.id);
    this.icefuryCasts = this.abilityTracker.getAbility(SPELLS.ICEFURY.id).casts;
  }

  on_cast(event) {
      if (event.ability.guid === SPELLS.FROST_SHOCK.id) {
          if (this.selectedCombatant.hasBuff(SPELLS.FROST_SHOCK.id)) {
              this.empoweredFrostShockCasts++;
          }
      }
  }
}

export default Icefury;
