import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SpellIcon from 'common/SpellIcon';

class GreenskinsWickers extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  greenskinProcs: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.GREENSKINS_WICKERS.bonusID);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GREENSKINS_WICKERS_BUFF), this.onGreenskinBuff);
  }

  // Not sure what else should be tracked here. Maybe the total damage done by Pistol Shot with this legendary equipped?
  onGreenskinBuff(event: ApplyBuffEvent) {
    this.greenskinProcs += 1;
  }

  statistic() {
    return (
      <Statistic size="flexible" tooltip="This shows you the amount of procs gained from Greenskin's Wickers Legendary.">
        <BoringSpellValueText spell={SPELLS.GREENSKINS_WICKERS}>
          <SpellIcon id={SPELLS.GREENSKINS_WICKERS.id} /> {this.greenskinProcs} <small>Procs gained</small>
        </BoringSpellValueText>
      </Statistic>
    )
  }
}

export default GreenskinsWickers;