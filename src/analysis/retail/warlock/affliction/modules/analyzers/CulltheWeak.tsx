import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';

const CDR_MS = 1500;
const targetSpellId = TALENTS.DARK_HARVEST_TALENT.id;

class CullTheWeak extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  effectiveCdrMs = 0;
  wastedCdrMs = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.CULL_THE_WEAK_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.UNSTABLE_AFFLICTION, SPELLS.SEED_OF_CORRUPTION_DEBUFF]),
      this.onCast,
    );
  }

  onCast(_event: CastEvent) {
    const actualReduction = this.deps.spellUsable.reduceCooldown(targetSpellId, CDR_MS);

    this.effectiveCdrMs += actualReduction;
    this.wastedCdrMs += CDR_MS - actualReduction;
  }
}

export default CullTheWeak;
