import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EnergizeEvent, HealEvent } from 'parser/core/Events';

import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { formatNumber, formatPercentage } from 'common/format';

const RELISH_IN_BLOOD_RP = 10;

class RelishInBlood extends Analyzer {

  runicPowerGained = 0;
  runicPowerWasted = 0;
  healing = 0;
  overhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RELISH_IN_BLOOD_TALENT.id);

    this.addEventListener(Events.energize.spell(SPELLS.RELISH_IN_BLOOD), this._relishBuffed)
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RELISH_IN_BLOOD), this._onHeal);
  }

  _relishBuffed(event: EnergizeEvent) {
    const rpGain = event.resourceChange;

    this.runicPowerGained += rpGain
    this.runicPowerWasted += RELISH_IN_BLOOD_RP - rpGain
  }

  _onHeal(event: HealEvent) {
    if (event.overheal) {
      this.overhealing += event.overheal
    }
    this.healing += event.amount + event.absorb
  }

  get overhealPercentage() {
    return this.overhealing / this.healing
  }

  get rpWastePercentage() {
    return this.runicPowerWasted / this.runicPowerGained
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(
          <>
            <strong>RP wasted: </strong> {this.runicPowerWasted} ({formatPercentage(this.rpWastePercentage)} %)<br />
            <strong>Healing: </strong> {formatNumber(this.healing)} <br />
            <strong>Overhealing: </strong> {formatNumber(this.overhealing)} ({formatPercentage(this.overhealPercentage)} %) <br />
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.RELISH_IN_BLOOD_TALENT}>
          <>
            {this.runicPowerGained} <small>RP gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default RelishInBlood;
