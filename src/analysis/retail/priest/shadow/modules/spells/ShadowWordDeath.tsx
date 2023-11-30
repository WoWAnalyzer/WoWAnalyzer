import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import { TIERS } from 'game/TIERS';
import { SHADOW_WORD_DEATH_EXECUTE_RANGE } from '../../constants';

class ShadowWordDeath extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = SHADOW_WORD_DEATH_EXECUTE_RANGE;
  static singleExecuteEnablers: Spell[] = [SPELLS.DEATHSPEAKER_TALENT_BUFF];
  //static executeOutsideRangeEnablers: Spell[] = [TALENTS.INESCAPABLE_TORMENT_TALENT]; //Need to fabricate a buff for when Inescapable Torment(mindbender) is active.
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

    if (this.selectedCombatant.has4PieceByTier(TIERS.T31)) {
      ShadowWordDeath.lowerThreshold = 1; //When shadow has its tier 31 four piece, they always use shadow word death
    }

    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(TALENTS.SHADOW_WORD_DEATH_TALENT);

    (options.abilities as Abilities).add({
      spell: TALENTS.SHADOW_WORD_DEATH_TALENT.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: 10,
      charges: 1,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: false,
        recommendedEfficiency: 0.85,
        maxCasts: () => this.maxCasts,
      },
    });
  }

  adjustMaxCasts() {
    const cooldown =
      this.abilities.getAbility(TALENTS.SHADOW_WORD_DEATH_TALENT.id)!.cooldown * 1000;
    const ExecuteCasts = Math.ceil(this.totalExecuteDuration / cooldown);

    if (this.selectedCombatant.hasTalent(TALENTS.DEATH_AND_MADNESS_TALENT)) {
      //The Death and Madness talent lets you cast twice each cast in execute.
      this.maxCasts += ExecuteCasts;
    }
    this.maxCasts += ExecuteCasts + this.totalNonExecuteCasts;
  }
}

export default ShadowWordDeath;
