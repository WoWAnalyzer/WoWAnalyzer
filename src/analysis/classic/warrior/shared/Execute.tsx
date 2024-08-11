import SPELLS from 'common/SPELLS/classic';
import type Spell from 'common/SPELLS/Spell';
import { SELECTED_PLAYER, type Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';

// TODO not sure if we actually need this module since this ability has no cooldown? but there are other things that care about execute time ranges (e.g. DoxAshe has some Shadow UI for that, and maybe APL stuff?)
export default class Execute extends ExecuteHelper.withDependencies({ abilities: Abilities }) {
  static executeSpells: Spell[] = [SPELLS.EXECUTE];
  static lowerThreshold = 0.2;
  static executeSources = SELECTED_PLAYER;

  constructor(options: Options) {
    super(options);

    this.deps.abilities.add({
      spell: SPELLS.EXECUTE.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      gcd: { base: 1500 },
    });
  }
}
