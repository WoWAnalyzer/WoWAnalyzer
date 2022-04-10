import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { ASS_VEN_CDR_PER_ENERGY } from '@wowanalyzer/rogue';

class DuskwalkersPatch extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveVendettaReductionMs: number = 0;
  wastedVendettaReductionMs: number = 0;
  lastEnergyCost: number = 0;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.DUSKWALKERS_PATCH);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.FOCUS.id,
    );
    if (!resource) {
      return;
    }
    this.lastEnergyCost = resource.cost || 0;
    const cooldownReductionMs = ASS_VEN_CDR_PER_ENERGY * (resource.cost || 0);
    const effectiveReductionMs =
      cooldownReductionMs - this.spellUsable.cooldownRemaining(SPELLS.VENDETTA.id);
    if (effectiveReductionMs < cooldownReductionMs) {
      this.wastedVendettaReductionMs += cooldownReductionMs - effectiveReductionMs;
    }
    this.effectiveVendettaReductionMs += this.spellUsable.reduceCooldown(
      SPELLS.VENDETTA.id,
      cooldownReductionMs,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spellId={SPELLS.DUSKWALKERS_PATCH.id}>
          {formatNumber(this.effectiveVendettaReductionMs / 1000)}s/
          {formatNumber(
            (this.wastedVendettaReductionMs + this.effectiveVendettaReductionMs) / 1000,
          )}
          s <small> cooldown reduction</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DuskwalkersPatch;
