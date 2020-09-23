import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { formatNumber } from 'common/format';
import SPECS from 'game/SPECS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { CastEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

/**
 * Every 20 (MM/SV) or 30 (BM) focus you spend reducxes the remaining cooldown
 * of Exhilaration by 1 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/GWwtNLVQD8adn6q9#fight=5&type=summary&source=18
 */

const MM_SV_CDR_PER_FOCUS = 1000 / 20;
const BM_CDR_PER_FOCUS = 1000 / 30;

class NaturalMending extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  cdrPerFocus = MM_SV_CDR_PER_FOCUS;
  effectiveExhilReductionMs = 0;
  wastedExhilReductionMs = 0;
  lastFocusCost = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NATURAL_MENDING_TALENT.id);
    if (this.active && this.selectedCombatant.spec === SPECS.BEAST_MASTERY_HUNTER) {
      this.cdrPerFocus = BM_CDR_PER_FOCUS;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    const resource = event.classResources?.find(resource => resource.type === RESOURCE_TYPES.FOCUS.id);
    if (!resource) {
      return;

    }
    this.lastFocusCost = resource.cost || 0;
    const cooldownReductionMS = this.cdrPerFocus * this.lastFocusCost;
    if (!this.spellUsable.isOnCooldown(SPELLS.EXHILARATION.id)) {
      this.wastedExhilReductionMs += cooldownReductionMS;
      return;
    }
    if (this.spellUsable.cooldownRemaining(SPELLS.EXHILARATION.id) < cooldownReductionMS) {
      const effectiveReductionMs = this.spellUsable.reduceCooldown(SPELLS.EXHILARATION.id, cooldownReductionMS);
      this.effectiveExhilReductionMs += effectiveReductionMs;
      this.wastedExhilReductionMs += (cooldownReductionMS - effectiveReductionMs);
      return;
    }
    this.effectiveExhilReductionMs += this.spellUsable.reduceCooldown(SPELLS.EXHILARATION.id, cooldownReductionMS);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.NATURAL_MENDING_TALENT}>
          <>
            {formatNumber(this.effectiveExhilReductionMs / 1000)}s/{formatNumber((this.wastedExhilReductionMs + this.effectiveExhilReductionMs) / 1000)}s <small> cooldown reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NaturalMending;
