import SPELLS from 'common/SPELLS';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { VIOLENT_TRANSFORMATION_AFFECTED_SPELLS } from '../../constants';

class ViolentTransformation extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_DEMON_HUNTER.VIOLENT_TRANSFORMATION_TALENT,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VOID_METAMORPHOSIS_BUFF),
      this.onApplyBuff,
    );
  }

  onApplyBuff() {
    for (const affectedSpell of VIOLENT_TRANSFORMATION_AFFECTED_SPELLS) {
      if (this.deps.spellUsable.isOnCooldown(affectedSpell.id)) {
        this.deps.spellUsable.endCooldown(affectedSpell.id);
      }
    }
  }
}

export default ViolentTransformation;
