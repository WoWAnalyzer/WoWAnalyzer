import React from 'react';

import ItemHealingDone from 'interface/ItemHealingDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import COVENANTS from 'game/shadowlands/COVENANTS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import AtonementDamageSource from '../../features/AtonementDamageSource';
import isAtonement from '../../core/isAtonement';

class Mindgames extends Analyzer {
  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
  };
  atonementHealing = 0;
  directHealing = 0;
  preventedDamage = 0;
  protected atonementDamageSource!: AtonementDamageSource;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.MINDGAMES_ABSORB), this.onMindgamesAbsorbed);
  }

  onHeal(event: HealEvent) {
    if (isAtonement(event)) {

      const atonenementDamageEvent = this.atonementDamageSource.event;
      if (!atonenementDamageEvent || atonenementDamageEvent.ability.guid !== SPELLS.MINDGAMES.id) {
        return;
      }

      this.atonementHealing += event.amount + (event.absorbed || 0);
      return;
    }

    const spellId = event.ability.guid;
    if (spellId === SPELLS.MINDGAMES_HEAL.id) {
      this.directHealing += event.amount + (event.absorbed || 0);
      return;
    }
  }

  onMindgamesAbsorbed(event: AbsorbedEvent) {
    this.preventedDamage += event.amount;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            Healing Breakdown:
            <ul>
              <li>{formatNumber(this.atonementHealing)} Atonement Healing</li>
              <li>{formatNumber(this.directHealing)} Direct Healing</li>
              <li>{formatNumber(this.preventedDamage)} Prevented Damage</li>
            </ul>
          </>
        )}
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.MINDGAMES}>
          <>
            <ItemHealingDone amount={this.atonementHealing + this.directHealing + this.preventedDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Mindgames;
