import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, EndChannelEvent, RefreshBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class LavaSurge extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  private lavaSurgeDuringLvB = false;
  private isCastingLvB = false;

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
    if (this.isCastingLvB) {
      this.lavaSurgeDuringLvB = true;
    }
    if (this.deps.spellUsable.isOnCooldown(TALENTS.LAVA_BURST_TALENT.id)) {
      this.deps.spellUsable.endCooldown(
        TALENTS.LAVA_BURST_TALENT.id,
        event.timestamp,
        false,
        false,
      );
    }
  }

  onEndCast(event: EndChannelEvent) {
    this.isCastingLvB = false;
    if (
      this.lavaSurgeDuringLvB &&
      this.deps.spellUsable.isOnCooldown(TALENTS.LAVA_BURST_TALENT.id)
    ) {
      this.deps.spellUsable.endCooldown(
        TALENTS.LAVA_BURST_TALENT.id,
        event.timestamp + 1,
        false,
        false,
      );
    }
    this.lavaSurgeDuringLvB = false;
  }
}

export default LavaSurge;
