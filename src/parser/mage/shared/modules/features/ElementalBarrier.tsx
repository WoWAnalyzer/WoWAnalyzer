import React from 'react';
import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import DamageTaken from 'parser/shared/modules/throughput/DamageTaken';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { AbsorbedEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

class ElementalBarrier extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    damageTaken: DamageTaken,
  }
  protected abilityTracker!: AbilityTracker;
  protected damageTaken!: DamageTaken;
  
  damageAbsorbed: number = 0;
  barrierSpell: {
    id: number,
    name: string,
    icon: string,
  }

  constructor(options: Options) {
    super(options);
    const spec = this.selectedCombatant.specId;
    this.barrierSpell = spec === SPECS.FROST_MAGE.id ? SPELLS.ICE_BARRIER : spec === SPECS.FIRE_MAGE.id ? SPELLS.BLAZING_BARRIER : SPELLS.PRISMATIC_BARRIER;
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(this.barrierSpell), this.onDamageAbsorbed);
  }

  onDamageAbsorbed(event: AbsorbedEvent) {
    this.damageAbsorbed += event.amount;
  }

  get percentAbsorbed() {
    return this.damageAbsorbed / this.damageTaken.total.effective;
  }

  get absorbedPerCast() {
    return this.damageAbsorbed / this.abilityTracker.getAbility(this.barrierSpell.id).casts;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(31)}
        size="flexible"
        tooltip={<>This is the amount of damage that was absorbed by your {this.barrierSpell.name}. Try to use this in anticipation of incoming damage to help reduce the amount of damage that your healers need to heal.</>}
      >
        <BoringSpellValueText spell={this.barrierSpell}>
          <>
            {formatNumber(this.damageAbsorbed)} <small>Damage absorbed</small><br />
            {formatNumber(this.absorbedPerCast)} <small>Avg. absorbed per barrier</small><br />
            {formatPercentage(this.percentAbsorbed)}% <small> % of Damage absorbed</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ElementalBarrier;
