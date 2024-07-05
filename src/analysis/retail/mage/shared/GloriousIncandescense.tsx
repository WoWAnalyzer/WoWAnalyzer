import SPECS from 'game/SPECS';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class GloriousIncandescence extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GLORIOUS_INCANDESCENCE_TALENT);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.GLORIOUS_INCANDESCENCE_BUFF),
      this.onBuffRemoved,
    );
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    if (this.selectedCombatant.spec === SPECS.FIRE_MAGE) {
      this.spellUsable.reduceCooldown(TALENTS.FIRE_BLAST_TALENT.id, 4000);
    }

    if (this.selectedCombatant.spec === SPECS.ARCANE_MAGE) {
      this.spellUsable.reduceCooldown(SPELLS.ARCANE_ORB.id, 8000);
    }
  }
}

export default GloriousIncandescence;
