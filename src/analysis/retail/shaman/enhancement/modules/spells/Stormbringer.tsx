import SPELLS from 'common/SPELLS/shaman';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class Stormbringer extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STORMBRINGER_BUFF),
      this.onStormbringerApplied,
    );
  }

  onStormbringerApplied() {
    if (this.spellUsable.isOnCooldown(TALENTS_SHAMAN.STORMSTRIKE_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS_SHAMAN.STORMSTRIKE_TALENT.id);
    }

    if (this.spellUsable.isOnCooldown(SPELLS.WINDSTRIKE_CAST.id)) {
      this.spellUsable.endCooldown(SPELLS.WINDSTRIKE_CAST.id);
    }
  }
}

export default Stormbringer;
