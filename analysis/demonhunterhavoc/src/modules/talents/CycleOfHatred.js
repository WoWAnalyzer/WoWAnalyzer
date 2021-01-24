import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'parser/ui/TalentStatisticBox';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { SpellIcon } from 'interface';

/*
  example report: https://www.warcraftlogs.com/reports/QxHJ9MTtmVYNXPLd/#fight=1&source=2
 */

const COOLDOWN_REDUCTION_MS = 3000;

class CycleOfHatred extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  totalCooldownReduction = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CYCLE_OF_HATRED_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.CHAOS_STRIKE_ENERGIZE), this.onEnergizeEvent);
  }

  onEnergizeEvent(event) {
    if (!this.spellUsable.isOnCooldown(SPELLS.EYE_BEAM.id)) {
      return;
    }
    const effectiveReduction = this.spellUsable.reduceCooldown(SPELLS.EYE_BEAM.id, COOLDOWN_REDUCTION_MS);
    this.totalCooldownReduction += effectiveReduction;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.CYCLE_OF_HATRED_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(7)}
        value={<>{formatNumber(this.totalCooldownReduction / 1000)} sec <small>total <SpellIcon id={SPELLS.EYE_BEAM.id} /> Eye Beam cooldown reduction</small></>}
      />
    );
  }
}

export default CycleOfHatred;
