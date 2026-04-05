import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SharedBrews from '../core/SharedBrews';
import { Options } from 'parser/core/Module';
import SPELLS from '../../spell-list_Monk_Brewmaster.retail';
import SPELLS_COMMON from 'common/SPELLS';
import Events from 'parser/core/Events';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import Spell from 'common/SPELLS/Spell';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

const EMPTY_THE_CELLAR_CDR = 3000;

export default class EmptyTheCellar extends ExecuteHelper.withDependencies({
  brew: SharedBrews,
  abilities: Abilities,
}) {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = -1;
  static executeOutsideRangeEnablers: Spell[] = [SPELLS.EMPTY_THE_CELLAR_TALENT];

  static executeSpells = [SPELLS_COMMON.EMPTY_THE_CELLAR_CAST];
  static countCooldownAsExecuteTime = true;

  private ekCasts = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.EMPTY_THE_CELLAR_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS_COMMON.EMPTY_THE_CELLAR_DAMAGE),
      this.onDamage,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXPLODING_KEG_TALENT),
      this.onEKCast,
    );

    this.deps.abilities.add({
      spell: SPELLS_COMMON.EMPTY_THE_CELLAR_CAST.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 60,
      gcd: {
        static: 1000,
      },
      castEfficiency: {
        maxCasts: () => this.ekCasts,
      },
    });
  }

  onDamage() {
    this.deps.brew.reduceCooldown(EMPTY_THE_CELLAR_CDR);
  }

  onEKCast() {
    this.ekCasts += 1;
  }
}
