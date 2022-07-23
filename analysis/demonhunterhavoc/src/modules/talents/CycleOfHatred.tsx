import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/*
  example report: https://www.warcraftlogs.com/reports/QxHJ9MTtmVYNXPLd/#fight=1&source=2
 */

const COOLDOWN_REDUCTION_MS = 3000;

class CycleOfHatred extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  totalCooldownReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CYCLE_OF_HATRED_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.CHAOS_STRIKE_ENERGIZE),
      this.onEnergizeEvent,
    );
  }

  onEnergizeEvent(event: ResourceChangeEvent) {
    if (!this.spellUsable.isOnCooldown(SPELLS.EYE_BEAM.id)) {
      return;
    }
    const effectiveReduction = this.spellUsable.reduceCooldown(
      SPELLS.EYE_BEAM.id,
      COOLDOWN_REDUCTION_MS,
    );
    this.totalCooldownReduction += effectiveReduction;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(7)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.CYCLE_OF_HATRED_TALENT.id}>
          <>
            {formatNumber(this.totalCooldownReduction / 1000)} sec{' '}
            <small>
              total <SpellIcon id={SPELLS.EYE_BEAM.id} /> Eye Beam cooldown reduction
            </small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CycleOfHatred;
