import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { NATURAL_MENDING_CDR_PER_FOCUS } from '../constants';

/**
 * Every 20 (MM/SV) or 30 (BM) focus you spend reduces the remaining cooldown of Exhilaration by 1 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/GWwtNLVQD8adn6q9#fight=5&type=summary&source=18
 */

class NaturalMending extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  effectiveExhilReductionMs = 0;
  wastedExhilReductionMs = 0;
  lastFocusCost = 0;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.NATURAL_MENDING_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.FOCUS.id,
    );
    if (!resource) {
      return;
    }

    this.lastFocusCost = resource.cost || 0;
    const cooldownReductionMS = NATURAL_MENDING_CDR_PER_FOCUS * this.lastFocusCost;
    if (!this.spellUsable.isOnCooldown(SPELLS.EXHILARATION.id)) {
      this.wastedExhilReductionMs += cooldownReductionMS;
      return;
    }
    if (this.spellUsable.cooldownRemaining(SPELLS.EXHILARATION.id) < cooldownReductionMS) {
      const effectiveReductionMs = this.spellUsable.reduceCooldown(
        SPELLS.EXHILARATION.id,
        cooldownReductionMS,
      );
      this.effectiveExhilReductionMs += effectiveReductionMs;
      this.wastedExhilReductionMs += cooldownReductionMS - effectiveReductionMs;
      return;
    }
    this.effectiveExhilReductionMs += this.spellUsable.reduceCooldown(
      SPELLS.EXHILARATION.id,
      cooldownReductionMS,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.NATURAL_MENDING_TALENT}>
          <>
            {formatNumber(this.effectiveExhilReductionMs / 1000)}s/
            {formatNumber(
              (this.wastedExhilReductionMs + this.effectiveExhilReductionMs) / 1000,
            )}s <small> cooldown reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NaturalMending;
