import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const CDR_MS = 1500;
const targetSpellId = TALENTS.DARK_HARVEST_TALENT.id;

class CullTheWeak extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  effectiveCdrMs = 0;
  wastedCdrMs = 0;
  uaCastCount = 0;
  socCastCount = 0;

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

  onCast(event: CastEvent) {
    const actualReduction = this.deps.spellUsable.reduceCooldown(targetSpellId, CDR_MS);

    this.effectiveCdrMs += actualReduction;
    this.wastedCdrMs += CDR_MS - actualReduction;

    if (event.ability.guid === SPELLS.UNSTABLE_AFFLICTION.id) {
      this.uaCastCount += 1;
    } else {
      this.socCastCount += 1;
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.CULL_THE_WEAK_TALENT}>
          {(this.wastedCdrMs / 1000).toFixed(1)}s <small>CDR wasted</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CullTheWeak;
