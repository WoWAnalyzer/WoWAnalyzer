import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ExecuteHelper from 'parser/shared/ExecuteHelper';

class TouchOfDeath extends ExecuteHelper {
  static executeSpells = [
    SPELLS.TOUCH_OF_DEATH,
  ];
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = 0.15;
  static executeOutsideRangeEnablers = [];
  static modifiesDamage = false;

  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  maxCasts = 0;

  constructor(options) {
    super(options);
    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    options.abilities.add({
        spell: SPELLS.TOUCH_OF_DEATH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: 1000,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          maxCasts: () => this.maxCasts,
        },
      });
  }

  adjustMaxCasts(event) {
    super.onFightEnd(event);
    this.maxCasts += Math.ceil(this.totalExecuteDuration / 1800000);
  }
}

export default TouchOfDeath;
