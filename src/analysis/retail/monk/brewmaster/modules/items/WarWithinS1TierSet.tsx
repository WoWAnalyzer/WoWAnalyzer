import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export default class WarWithinS1TierSet extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.spell(SPELLS.FLOW_OF_BATTLE_KS_BUFF),
      this.resetKegSmash,
    );
  }

  private resetKegSmash(): void {
    this.deps.spellUsable.endCooldown(talents.KEG_SMASH_TALENT.id);
  }
}
