import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const RAGE_NEEDED_FOR_PROC = 20;
const CDR_PER_PROC = 1000; // ms

// Example log: /reports/41TzG8jMBNkvxg7f#fight=9&type=damage-done
class AngerManagement extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveReduction: number = 0;
  wastedReduction: number = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.ANGER_MANAGEMENT_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onPlayerCast);
  }

  onPlayerCast(event: CastEvent) {
    if (!event || !event.classResources || !event.classResources[0].cost) {
      return;
    }

    const rage = event.classResources.find((e) => e.type === RESOURCE_TYPES.RAGE.id);
    if (!rage || !rage.cost) {
      return;
    }

    const rageSpent = rage.cost / 10;
    const reduction = (rageSpent / RAGE_NEEDED_FOR_PROC) * CDR_PER_PROC;

    if (!this.spellUsable.isOnCooldown(SPELLS.RECKLESSNESS.id)) {
      this.wastedReduction += reduction;
    } else {
      const effectiveReduction = this.spellUsable.reduceCooldown(SPELLS.RECKLESSNESS.id, reduction);
      this.effectiveReduction += effectiveReduction;
      this.wastedReduction += reduction - effectiveReduction;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatNumber(this.wastedReduction / 1000)}s missed CDR`}
      >
        <BoringSpellValueText spellId={talents.ANGER_MANAGEMENT_TALENT.id}>
          <>{formatNumber(this.effectiveReduction / 1000)}s Recklessness CDR</>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AngerManagement;
