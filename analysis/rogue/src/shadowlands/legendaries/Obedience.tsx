import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class Obedience extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    enemies: Enemies,
  };
  protected spellUsable!: SpellUsable;
  protected enemies!: Enemies;

  effectiveFlegellationReductionMs: number = 0;
  lastComboPointCost: number = 0;
  wastedFlagellationReductionMs: number = 0;
  FLAGELLATION_CDR_MS_PER_CP: number = 1000;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.OBEDIENCE);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.FLAGELLATION.id)) {
      const resource = event.classResources?.find(
        (resource) => resource.type === RESOURCE_TYPES.COMBO_POINTS.id,
      );
      if (!resource) {
        return;
      }
      if (this.spellUsable.isOnCooldown(SPELLS.FLAGELLATION.id)) {
        this.lastComboPointCost = resource.cost || 0;
        const cooldownReductionMs = this.FLAGELLATION_CDR_MS_PER_CP * this.lastComboPointCost;

        const effectiveReductionMs =
          cooldownReductionMs - this.spellUsable.cooldownRemaining(SPELLS.FLAGELLATION.id);

        if (effectiveReductionMs < cooldownReductionMs) {
          this.wastedFlagellationReductionMs += cooldownReductionMs - effectiveReductionMs;
        }

        this.effectiveFlegellationReductionMs += this.spellUsable.reduceCooldown(
          SPELLS.FLAGELLATION.id,
          cooldownReductionMs,
        );
      }
    }
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spellId={SPELLS.OBEDIENCE.id}>
          {formatNumber(this.effectiveFlegellationReductionMs / 1000)}s{' '}
          <small> cooldown reduction </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Obedience;
