import SPELLS from 'common/SPELLS';
import TALENTS_MONK from 'common/TALENTS/monk';
import SPECS from 'game/SPECS';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';

class TouchOfDeath extends ExecuteHelper {
  static executeSpells = [SPELLS.TOUCH_OF_DEATH];
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = 0.15;
  static executeOutsideRangeEnablers = [];
  static modifiesDamage = false;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  maxCasts = 0;

  constructor(options) {
    super(options);
    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    options.abilities.add({
      spell: SPELLS.TOUCH_OF_DEATH.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 180 - 90 * this.selectedCombatant.getTalentRank(TALENTS_MONK.FATAL_TOUCH_TALENT),
      gcd:
        this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK ? { base: 1500 } : { static: 1000 },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.85,
        maxCasts: () => this.maxCasts || 0,
      },
    });
  }

  adjustMaxCasts(event) {
    super.onFightEnd(event);
    this.maxCasts += Math.ceil(this.totalExecuteDuration / this.cooldown);
  }
}

export default TouchOfDeath;
