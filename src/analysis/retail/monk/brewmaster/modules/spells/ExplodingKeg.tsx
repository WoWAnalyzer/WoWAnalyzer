import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from '../../spell-list_Monk_Brewmaster.retail';
import Events from 'parser/core/Events';

export default class ExplodingKeg extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.EXPLODING_KEG_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXPLODING_KEG_TALENT),
      this.onCast,
    );
  }

  onCast() {
    this.deps.spellUsable.endCooldown(SPELLS.KEG_SMASH_TALENT.id);
  }
}
