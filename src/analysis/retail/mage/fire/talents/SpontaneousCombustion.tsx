import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class SpontaneousCombustion extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SPONTANEOUS_COMBUSTION_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCombust);
  }

  onCombust(event: CastEvent) {
    if (this.selectedCombatant.getTalentRank(TALENTS.SPONTANEOUS_COMBUSTION_TALENT) === 2) {
      // If you have two points in Spontaneous Combustion, you gain 2 Charges.
      this.spellUsable.endCooldown(TALENTS.FIRE_BLAST_TALENT.id, event.timestamp, false);
      this.spellUsable.endCooldown(TALENTS.FIRE_BLAST_TALENT.id, event.timestamp, false);
    } else if (this.selectedCombatant.getTalentRank(TALENTS.SPONTANEOUS_COMBUSTION_TALENT) === 1) {
      // If you have one point in Spontaneous Combustion, you gain 1 charge.
      this.spellUsable.endCooldown(TALENTS.FIRE_BLAST_TALENT.id);
    }
  }
}

export default SpontaneousCombustion;
