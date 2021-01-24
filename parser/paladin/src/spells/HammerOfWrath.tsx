import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { FightEndEvent } from 'parser/core/Events';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import Spell from 'common/SPELLS/Spell';

class HammerofWrath extends ExecuteHelper {
  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  static executeSpells: Spell[] = [
    SPELLS.HAMMER_OF_WRATH,
  ];
  static executeSources: number = SELECTED_PLAYER;
  static lowerThreshold: number = 0.2;
  static executeOutsideRangeEnablers: Spell[] = [
    SPELLS.AVENGING_WRATH,
    SPELLS.AVENGING_CRUSADER_TALENT,
    SPELLS.CRUSADE_TALENT,
  ];
  static modifiesDamage: boolean = false;

  maxCasts: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    //FIXME added reduction from legendary when we can get that info
    (options.abilities as Abilities).add({
        spell: SPELLS.HAMMER_OF_WRATH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 7.5,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          maxCasts: () => this.maxCasts || 0,
        },
      });
  }

  adjustMaxCasts(event: FightEndEvent) {
    super.onFightEnd(event);
    this.maxCasts += Math.ceil(this.totalExecuteDuration / 7500);
  }
}

export default HammerofWrath;
