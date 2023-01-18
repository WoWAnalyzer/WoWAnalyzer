import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
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

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDFORM_BUFF),
      this.onBuffRemoved,
    );
  }

  enterVoidform(event: ApplyBuffEvent) {
    this.abilities.increaseMaxCharges(event, SPELLS.MIND_BLAST.id, 1);
    console.log('voidform');
    if (this.spellUsable.isOnCooldown(SPELLS.MIND_BLAST.id)) {
      this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id, event.timestamp, false, true);
      //Voidform can restore another charges if the spell is still on cooldown after the first.
      if (this.spellUsable.isOnCooldown(SPELLS.MIND_BLAST.id)) {
        this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id, event.timestamp, false, true);
      }
    }
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    this.abilities.decreaseMaxCharges(event, SPELLS.MIND_BLAST.id, 1);
  }
}

export default Voidform;
