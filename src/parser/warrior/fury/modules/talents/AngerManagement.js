import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

const RAGE_NEEDED_FOR_PROC = 20;
const CDR_PER_PROC = 1000; // ms

class AngerManagement extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  }


  wastedReduction = 0;
  effectiveReduction = 0;
  totalRageSpent = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTalent(SPELLS.ANGER_MANAGEMENT_TALENT.id);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onPlayerCast);
  }

  onPlayerCast(event) {
    if (!event || !event.classResources || !event.classResources[0].cost) {
      return;
    }

    const rage = event.classResources.find(e => e.type === RESOURCE_TYPES.RAGE.id);
    if (!rage || !rage.cost) {
      return;
    }

    const rageSpent = rage.cost / 10;
    const reduction = rageSpent / RAGE_NEEDED_FOR_PROC * CDR_PER_PROC;

    if (!this.spellUsable.isOnCooldown(SPELLS.RECKLESSNESS.id)) {
      this.wastedReduction += reduction;
    } else {
      const effectiveReduction = this.spellUsable.reduceCooldown(SPELLS.RECKLESSNESS.id, reduction);
      this.effectiveReduction += effectiveReduction;
      this.wastedReduction += reduction - effectiveReduction;
    }

  this.totalRageSpent += rageSpent;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.ANGER_MANAGEMENT_TALENT.id}
        value={`${formatNumber(this.effectiveReduction / 1000)}s Recklessness CDR`}
        label="Anger Management"
        />
    );
  }

}

export default AngerManagement;
