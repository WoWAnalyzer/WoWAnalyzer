import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { ACCRETION_CDR_MS } from 'analysis/retail/evoker/augmentation/constants';

class Accretion extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  currentUpheavel = this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT)
    ? SPELLS.UPHEAVAL_FONT.id
    : SPELLS.UPHEAVAL.id;

  constructor(options: Options) {
    super(options);
    // FIXME: remove comment
    //this.active = this.selectedCombatant.hasTalent(TALENTS.ACCRETION_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ERUPTION_TALENT),
      this.onCast,
    );
  }

  onCast() {
    this.spellUsable.reduceCooldown(this.currentUpheavel, ACCRETION_CDR_MS);
  }
}

export default Accretion;
