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
    //Voidform restores all charges of mindblast.
    this.casts += 1;
    this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id, event.timestamp, true, true);
    //TODO: Track number of mindblast charges restored.
  }

  /*currenlty unused, but will be used to calculate missed recharges of mindblast when using Voidform
  get gainedMB() {
    return this.mindblast;
  }

  get potentialMB() {
    return this.casts * 2;
  }
  */
}

export default Voidform;
