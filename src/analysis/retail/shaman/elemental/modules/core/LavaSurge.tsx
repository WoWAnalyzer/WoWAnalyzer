import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, EndChannelEvent, RefreshBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class LavaSurge extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private lavaSurgeDuringLvB: boolean = false;
  private isCastingLvB: boolean = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LAVA_SURGE),
      this.applyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.LAVA_SURGE),
      this.applyBuff,
    );

    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(TALENTS.LAVA_BURST_TALENT),
      () => (this.isCastingLvB = true),
    );
    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(TALENTS.LAVA_BURST_TALENT),
      this.onEndCast,
    );
  }

  applyBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id, event.timestamp)) {
      return;
    }
    if (this.isCastingLvB) {
      this.lavaSurgeDuringLvB = true;
    }
    if (this.spellUsable.isOnCooldown(TALENTS.LAVA_BURST_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS.LAVA_BURST_TALENT.id, event.timestamp, false, false);
    }
  }

  onEndCast(event: EndChannelEvent) {
    this.isCastingLvB = false;
    if (this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id, event.timestamp)) {
      return;
    }
    if (this.lavaSurgeDuringLvB && this.spellUsable.isOnCooldown(TALENTS.LAVA_BURST_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS.LAVA_BURST_TALENT.id, event.timestamp + 1, false, false);
    }
    this.lavaSurgeDuringLvB = false;
  }
}

export default LavaSurge;
