import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class Voidform extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDFORM_BUFF),
      this.enterVoidform,
    );
  }

  enterVoidform(event: ApplyBuffEvent) {
    //Voidform can restore two charges of mindblast.
    if (this.spellUsable.isOnCooldown(SPELLS.MIND_BLAST.id)) {
      this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id, event.timestamp, false, true);
      if (this.spellUsable.isOnCooldown(SPELLS.MIND_BLAST.id)) {
        this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id, event.timestamp, false, true);
      }
    }
  }
}

export default Voidform;
