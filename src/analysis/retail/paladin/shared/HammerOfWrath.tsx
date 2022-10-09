import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Spell from 'common/SPELLS/Spell';
import SPECS from 'game/SPECS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { FightEndEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';

class HammerofWrath extends ExecuteHelper {
  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  static executeSpells: Spell[] = [TALENTS.HAMMER_OF_WRATH_TALENT];
  static executeSources: number = SELECTED_PLAYER;
  static lowerThreshold: number = 0.2;
  static executeOutsideRangeEnablers: Spell[] = [
    SPELLS.AVENGING_WRATH,
    TALENTS.AVENGING_CRUSADER_TALENT,
    TALENTS.CRUSADE_TALENT,
  ];
  static modifiesDamage: boolean = false;

  maxCasts: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    //FIXME added reduction from legendary when we can get that info
    (options.abilities as Abilities).add({
      spell: TALENTS.HAMMER_OF_WRATH_TALENT.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: (haste) => 7.5 / (1 + haste),
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency:
          this.owner.characterProfile?.spec === SPECS.HOLY_PALADIN.specName ? 0.65 : 0.85,
        maxCasts: () => this.maxCasts,
      },
    });
  }

  adjustMaxCasts(event: FightEndEvent) {
    const cooldown = this.abilities.getAbility(TALENTS.HAMMER_OF_WRATH_TALENT.id)!.cooldown * 1000;
    super.onFightEnd(event);
    this.maxCasts += Math.ceil(this.totalExecuteDuration / cooldown);
  }
}

export default HammerofWrath;
