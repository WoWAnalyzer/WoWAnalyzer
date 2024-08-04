import SPELLS from 'common/SPELLS/classic';
import Spell from 'common/SPELLS/Spell';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';

export default class Overpower extends ExecuteHelper.withDependencies({ abilities: Abilities }) {
  static executeSpells: Spell[] = [SPELLS.OVERPOWER];
  static singleExecuteEnablers: Spell[] = [SPELLS.TASTE_FOR_BLOOD];
  static executeSources = SELECTED_PLAYER;

  protected get maxCasts(): number {
    return this.singleExecuteEnablerApplications;
  }

  constructor(options: Options) {
    super(options);

    this.deps.abilities.add({
      spell: SPELLS.OVERPOWER.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      gcd: { base: 1500 },
      castEfficiency: {
        suggestion: false,
        maxCasts: () => this.maxCasts,
      },
    });
  }
}
