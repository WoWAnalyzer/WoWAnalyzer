import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { formatNumber } from 'common/format';
import SPECS from 'game/SPECS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Events, { CastEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import { BM_CDR_PER_FOCUS, MM_SV_CDR_PER_FOCUS } from './constants';

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
  cdrPerFocus = MM_SV_CDR_PER_FOCUS;
  effectiveExhilReductionMs = 0;
  wastedExhilReductionMs = 0;
  lastFocusCost = 0;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
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
