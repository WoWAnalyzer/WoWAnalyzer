import SPELLS from 'common/SPELLS';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class MassAcceleration extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.MASS_ACCELERATION_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOID_METAMORPHOSIS_CAST),
      this.onCast,
    );
  }

  onCast() {
    if (this.deps.spellUsable.isOnCooldown(SPELLS.REAP.id)) {
      this.deps.spellUsable.endCooldown(SPELLS.REAP.id);
    }
  }
}

export default MassAcceleration;
