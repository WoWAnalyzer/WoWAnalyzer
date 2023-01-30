import TALENTS from 'common/TALENTS/priest';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';

import { SHADOW_WORD_DEATH_EXECUTE_RANGE } from '../../constants';

class ShadowWordDeath extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = SHADOW_WORD_DEATH_EXECUTE_RANGE;
  static countCooldownAsExecuteTime = false;

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
    ctor.executeSpells.push(TALENTS.SHADOW_WORD_DEATH_TALENT);

    (options.abilities as Abilities).add({
      spell: TALENTS.SHADOW_WORD_DEATH_TALENT.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: (haste: number) => 20,
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
    const cooldown =
      this.abilities.getAbility(TALENTS.SHADOW_WORD_DEATH_TALENT.id)!.cooldown * 1000;
    const ExecuteCasts = Math.ceil(this.totalExecuteDuration / cooldown);

    if (this.selectedCombatant.hasTalent(TALENTS.DEATH_AND_MADNESS_TALENT)) {
      //The Death and Madness talent lets you cast twice each cooldown.
      this.maxCasts += ExecuteCasts;
    }
    this.maxCasts += ExecuteCasts + this.totalNonExecuteCasts;
  }
}

export default ShadowWordDeath;
