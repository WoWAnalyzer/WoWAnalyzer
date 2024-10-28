import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export default class BurstOfPower extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BURST_OF_POWER_TALENT);

    this.addEventListener(Events.applybuff.spell(SPELLS.BURST_OF_POWER_BUFF), this.resetShieldSlam);

    this.addEventListener(
      Events.removebuffstack.spell(SPELLS.BURST_OF_POWER_BUFF),
      this.resetShieldSlam,
    );
  }

  private resetShieldSlam(): void {
    this.deps.spellUsable.endCooldown(SPELLS.SHIELD_SLAM.id);
  }
}
