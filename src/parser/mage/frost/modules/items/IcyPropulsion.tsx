import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import UptimeIcon from 'interface/icons/Uptime';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import HIT_TYPES from 'game/HIT_TYPES';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { formatNumber } from 'common/format';

const COOLDOWN_REDUCTION_MS: {[rank: number]: number } = {
  1: 250,
  2: 300,
  3: 400,
  4: 500,
  5: 600,
  6: 700,
  7: 800,
  8: 900,
  9: 1000,
  10: 1100,
  11: 1200,
  12: 1300,
  13: 1400,
  14: 1500,
  15: 1600,
};

class IcyPropulsion extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  conduitRank: number = 0;

  cooldownReduction = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.ICY_PROPULSION.id);
    if (!this.active) {
      return;
    }
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.ICY_PROPULSION.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.ICY_VEINS.id) || event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.ICY_VEINS.id,COOLDOWN_REDUCTION_MS[this.conduitRank]);

  }

  get reductionSeconds() {
    return this.cooldownReduction / 1000;
  }

  get reductionPerIcyVeins() {
    return this.reductionSeconds / this.abilityTracker.getAbility(SPELLS.ICY_VEINS.id).casts;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={<>Icy Propulsion reduced the cooldown on Icy Veins by a total of {this.reductionSeconds} ({this.reductionPerIcyVeins} Per Icy Veins on average).</>}
      >
        <BoringSpellValueText spell={SPELLS.ICY_PROPULSION}>
          <UptimeIcon /> {`${formatNumber(this.reductionSeconds)}s`} <small>Icy Veins CDR</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }


}

export default IcyPropulsion;
