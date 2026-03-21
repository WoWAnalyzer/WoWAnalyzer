import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from '../../../spell-list_Monk_Brewmaster.retail';
import SPELLS_COMMON from 'common/SPELLS';
import Events from 'parser/core/Events';

export default class EmptyBarrel extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.BRING_ME_ANOTHER_TALENT_1);

    this.addEventListener(
      Events.applybuff.spell(SPELLS_COMMON.EMPTY_BARREL_BUFF).to(SELECTED_PLAYER),
      this.onBuffApply,
    );
    this.addEventListener(
      Events.refreshbuff.spell(SPELLS_COMMON.EMPTY_BARREL_BUFF).to(SELECTED_PLAYER),
      this.onBuffApply,
    );
    // not tracking wasted at this time, just want cdr correct.
  }

  onBuffApply() {
    this.deps.spellUsable.endCooldown(SPELLS.KEG_SMASH_TALENT.id);
  }
}
