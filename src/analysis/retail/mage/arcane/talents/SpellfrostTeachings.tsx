import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { DamageEvent } from 'parser/core/Events';

const REDUCTION_MS = 250;

class SpellfrostTeachings extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SPELLFROST_TEACHINGS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_SPLINTER_DAMAGE),
      this.onSplinter,
    );
  }

  onSplinter(event: DamageEvent) {
    this.spellUsable.reduceCooldown(SPELLS.ARCANE_ORB.id, REDUCTION_MS);
  }
}

export default SpellfrostTeachings;
