import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const REDUCTION = 500;

class TrainOfThought extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.TRAIN_OF_THOUGHT_TALENT);

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.SMITE, SPELLS.SHADOW_SMITE, SPELLS.VOID_BLAST_DAMAGE_DISC]),
      this.onCdrCast,
    );
  }

  onCdrCast(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.PENANCE.id)) {
      this.spellUsable.reduceCooldown(SPELLS.PENANCE.id, REDUCTION, event.timestamp);
    }
  }
}

export default TrainOfThought;
