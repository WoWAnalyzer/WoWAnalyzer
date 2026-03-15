import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { DamageEvent } from 'parser/core/Events';

const REDUCTION_MS = 500;

class Pyrocosm extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PYROCOSM_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.METEORITE_DAMAGE),
      this.onMeteoriteDamage,
    );
  }

  onMeteoriteDamage(event: DamageEvent) {
    this.spellUsable.reduceCooldown(SPELLS.FIRE_BLAST.id, REDUCTION_MS, event.timestamp);
  }
}

export default Pyrocosm;
