import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class AvatarOfTheStorm extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private hasThunderBlast = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AVATAR_TALENT);

    if (!this.active) {
      return;
    }

    this.hasThunderBlast = this.selectedCombatant.hasTalent(TALENTS.THUNDER_BLAST_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.THUNDER_BLAST_BUFF),
      this.onThunderBlastAvailable,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.THUNDER_BLAST_BUFF),
      this.onThunderBlastAvailable,
    );
  }

  private onThunderBlastAvailable(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    // Thunder Blast stacks make Thunder Clap immediately castable
    if (this.hasThunderBlast) {
      this.spellUsable.endCooldown(SPELLS.THUNDER_CLAP.id, event.timestamp);
    }
  }
}

export default AvatarOfTheStorm;
