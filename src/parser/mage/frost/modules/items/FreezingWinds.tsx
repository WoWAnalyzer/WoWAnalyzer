import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import UptimeIcon from 'interface/icons/Uptime';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { formatNumber } from 'common/format';

const FROZEN_ORB_REDUCTION_MS = 2500;

class FreezingWinds extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  cooldownReduction = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.FREEZING_WINDS.bonusID);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FROSTBOLT), this.onFrostbolt);
  }

  onFrostbolt(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.FREEZING_WINDS.id) && this.spellUsable.isOnCooldown(SPELLS.FROZEN_ORB.id)) {
      this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id, FROZEN_ORB_REDUCTION_MS);
    }
  }

  get reductionSeconds() {
    return this.cooldownReduction / 1000;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip="This is the total amount of cooldown reduction that the Freezing Winds legendary removed from the Frozen Orb cooldown. This only counts reduction caused by the Freezing Winds legendary effect and not any reduction from other sources such as Blizzard."
      >
        <BoringSpellValueText spell={SPELLS.FREEZING_WINDS}>
          <UptimeIcon /> {`${formatNumber(this.reductionSeconds)}s`} <small>Frozen Orb CDR</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FreezingWinds;
