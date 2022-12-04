import { ASS_VEN_CDR_PER_ENERGY } from 'analysis/retail/rogue/shared';
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
    this.active = false;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.VENDETTA.id) {
      return;
    }
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.ENERGY.id,
    );
    if (!resource) {
      return;
    }
    this.lastEnergyCost = resource.cost || 0;
    const cooldownReductionMs = ASS_VEN_CDR_PER_ENERGY * this.lastEnergyCost;
    if (!this.spellUsable.isOnCooldown(SPELLS.VENDETTA.id)) {
      this.wastedVendettaReductionMs += cooldownReductionMs;
      return;
    }

    if (this.spellUsable.cooldownRemaining(SPELLS.VENDETTA.id) < cooldownReductionMs) {
      const effectiveReductionMs = this.spellUsable.reduceCooldown(
        SPELLS.VENDETTA.id,
        cooldownReductionMs,
      );
      this.effectiveVendettaReductionMs += effectiveReductionMs;
      this.wastedVendettaReductionMs += cooldownReductionMs - effectiveReductionMs;
      return;
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
