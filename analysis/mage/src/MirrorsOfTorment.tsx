import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { RemoveDebuffEvent, RemoveDebuffStackEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';

const FIRE_BLAST_REDUCTION_MS = 4000;

class MirrorsOfTorment extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  }
  protected spellUsable!: SpellUsable;

  //Currently only added to Fire Mage CombatLogParser, but leaving module in Shared in case i add to it for other specs
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);
    this.addEventListener(Events.removedebuffstack.by(SELECTED_PLAYER).spell(SPELLS.MIRRORS_OF_TORMENT), this.onDebuffRemoved);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.MIRRORS_OF_TORMENT), this.onDebuffRemoved);
  }

  onDebuffRemoved(event: RemoveDebuffEvent | RemoveDebuffStackEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.FIRE_BLAST.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FIRE_BLAST.id, FIRE_BLAST_REDUCTION_MS);
    }
  }
}

export default MirrorsOfTorment;
