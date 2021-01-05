import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';

const MINUTE = 600000;

class TouchOfDeath extends ExecuteHelper {
  static executeSpells = [
    SPELLS.TOUCH_OF_DEATH,
  ];
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = 0.15;
  static executeOutsideRangeEnablers = [];
  static modifiesDamage = false;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  maxCasts = 0;

  cooldown = MINUTE * 3;

  constructor(options) {
    super(options);
    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    //FIXME added reduction from legendary when we can get that info

    //if(hasLego) {
    //  this.cooldown = this.cooldown - MINUTE;
    // }

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
