import TALENTS from 'common/TALENTS/priest';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import { SHADOW_WORD_DEATH_EXECUTE_RANGE_DEATHSPEAKER } from '../../constants';
import DeathAndMadness from '../talents/DeathAndMadness';

//Making a whole copy of shadow word death for when deathspeaker is active seems silly
//But I don't konw of another way to update the lowerthreshold.

class ShadowWordDeathSpeaker extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = SHADOW_WORD_DEATH_EXECUTE_RANGE_DEATHSPEAKER;
  //static executeOutsideRangeEnablers: Spell[] = [TALENTS.INESCAPABLE_TORMENT_TALENT]; //TODO: Need to fabricate a buff for when Inescapable Torment(mindbender) is active.
  static countCooldownAsExecuteTime = false;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
    deathandmadness: DeathAndMadness,
  };

  protected abilities!: Abilities;
  protected deathandmadness!: DeathAndMadness;

  maxCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEATHSPEAKER_TALENT);

    this.addEventListener(Events.fightend, this.adjustMaxCasts);
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
    //The spellusable of SW:D is being tracked properly, however the value of the casts is not correct.
    //I do not know why that is the case.
    //To fix this, we calcuate the number of casts of SW:D
    //It is equal to executeTime/10s plus the number of procs of SW:D from Death and Madness,
    const cooldown =
      this.abilities.getAbility(TALENTS.SHADOW_WORD_DEATH_TALENT.id)!.cooldown * 1000;
    const ExecuteCasts = Math.ceil(this.totalExecuteDuration / cooldown);

    const DeathAndMadnessCasts = this.deathandmadness.getResets();

    //console.log("SWD Totals:",ExecuteCasts,"NE",this.totalNonExecuteCasts,"DM",DeathAndMadnessCasts,);

    this.maxCasts = ExecuteCasts + this.totalNonExecuteCasts + DeathAndMadnessCasts;
  }
}

export default ShadowWordDeathSpeaker;
