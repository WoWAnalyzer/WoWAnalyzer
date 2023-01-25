import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/hunter';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellUsable from '../core/SpellUsable';

/**
 * Every 5 Dire Beasts summoned resets the cooldown of Kill Command,
 * and reduces the Focus cost and cooldown of Kill Command by 50% for 8 sec.
 */
class DirePack extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIRE_PACK_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DIRE_PACK_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DIRE_PACK_BUFF),
      this.onRemoveBuff,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.spellUsable.applyCooldownRateChange(TALENTS.KILL_COMMAND_SHARED_TALENT.id, 0.5);
    if (!this.spellUsable.isOnCooldown(TALENTS.KILL_COMMAND_SHARED_TALENT.id)) {
      return;
    }
    this.spellUsable.endCooldown(TALENTS.KILL_COMMAND_SHARED_TALENT.id);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.spellUsable.removeCooldownRateChange(TALENTS.KILL_COMMAND_SHARED_TALENT.id, 0.5);
  }
}

export default DirePack;
