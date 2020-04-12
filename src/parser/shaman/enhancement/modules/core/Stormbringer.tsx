import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS/shaman';
import SpellUsable from 'parser/shared/modules/SpellUsable';


class Stormbringer extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: any) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER)
        .spell(SPELLS.STORMBRINGER_BUFF),
      this.onReset,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(SPELLS.STORMSTRIKE),
      this.onNoCooldown,
    );
  }

  onReset() {
    if (!this.spellUsable.isOnCooldown(SPELLS.STORMSTRIKE.id)) {
      return;
    }
    this.spellUsable.endCooldown(SPELLS.STORMSTRIKE.id);
  }

  onNoCooldown() {
    if (!this.selectedCombatant.hasBuff(SPELLS.STORMBRINGER_BUFF.id)) {
      return;
    }
    if (!this.spellUsable.isOnCooldown(SPELLS.STORMSTRIKE.id)) {
      return;
    }
    this.spellUsable.endCooldown(SPELLS.STORMSTRIKE.id);
  }

}

export default Stormbringer;
