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

  mindblast = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDFORM_BUFF),
      this.enterVoidform,
    );
  }

  enterVoidform(event: ApplyBuffEvent) {
    //Voidform can restore two charges of mindblast.
    //There are other ways to restore all charges, but this keeps track of the number of charges restored.
    this.casts += 1;
    if (this.spellUsable.isOnCooldown(SPELLS.MIND_BLAST.id)) {
      this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id, event.timestamp, false, false);
      this.mindblast += 1;
      if (this.spellUsable.isOnCooldown(SPELLS.MIND_BLAST.id)) {
        this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id, event.timestamp, false, false);
        this.mindblast += 1;
      }
    }
  }

  //currenlty unused, but will be used to calculate missed recharges of mindblast when using Voidform
  get gainedMB() {
    return this.mindblast;
  }

  get potentialMB() {
    return this.casts * 2;
  }
}

export default Voidform;
