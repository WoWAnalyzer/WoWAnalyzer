import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import Abilities from 'parser/core/modules/Abilities';

import { SHADOW_WORD_DEATH_EXECUTE_RANGE } from '../../constants';

class ShadowWordDeath extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = SHADOW_WORD_DEATH_EXECUTE_RANGE;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  maxCasts = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(SPELLS.SHADOW_WORD_DEATH);

    (options.abilities as Abilities).add({
      spell: SPELLS.SHADOW_WORD_DEATH,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      cooldown: (haste: number) => 20 / (1 + haste),
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
        maxCasts: () => this.maxCasts,
      },
    });

  }

  adjustMaxCasts() {
    const cooldown = this.abilities.getAbility(SPELLS.SHADOW_WORD_DEATH.id)!.cooldown * 1000;
    this.maxCasts += Math.ceil(this.totalExecuteDuration / cooldown) + this.totalNonExecuteCasts;
  }
}

export default ShadowWordDeath;
