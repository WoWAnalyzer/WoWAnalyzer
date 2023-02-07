import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import SpellUsable from '../core/SpellUsable';

class Deathblow extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.DEATHBLOW_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEATHBLOW_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DEATHBLOW_BUFF),
      this.onRefreshBuff,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (!this.spellUsable.isOnCooldown(SPELLS.KILL_SHOT_MM_BM.id)) {
      return;
    }
    this.spellUsable.endCooldown(SPELLS.KILL_SHOT_MM_BM.id, event.timestamp);
  }
  onRefreshBuff(event: RefreshBuffEvent) {
    if (!this.spellUsable.isOnCooldown(SPELLS.KILL_SHOT_MM_BM.id)) {
      return;
    }
    this.spellUsable.endCooldown(SPELLS.KILL_SHOT_MM_BM.id, event.timestamp);
  }
}

export default Deathblow;
