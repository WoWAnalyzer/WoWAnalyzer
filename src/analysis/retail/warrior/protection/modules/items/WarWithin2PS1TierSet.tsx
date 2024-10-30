import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/warrior';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export default class WarWithin2PS1TierSet extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(talents.STRATEGIST_TALENT) &&
      this.selectedCombatant.has2PieceByTier(TIERS.TWW1);

    this.addEventListener(
      Events.applybuff.spell(SPELLS.EXPERT_STRATEGIST_BUFF),
      this.resetShieldSlam,
    );

    this.addEventListener(
      Events.refreshbuff.spell(SPELLS.EXPERT_STRATEGIST_BUFF),
      this.resetShieldSlam,
    );
  }

  private resetShieldSlam(): void {
    this.deps.spellUsable.endCooldown(SPELLS.SHIELD_SLAM.id);
  }
}
