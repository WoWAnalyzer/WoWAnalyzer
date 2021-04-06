import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../core/AtonementAnalyzer';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';
import ItemHealingDone from 'interface/ItemHealingDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

// Mutating the events from years ago, just unlucky
interface DirtyDamageEvent extends DamageEvent {
  penanceBoltNumber?: number;
}
interface DirtyHealEvent extends HealEvent {
  penanceBoltNumber?: number;
}

class ThePenitentOne extends Analyzer {
  private expectedBolts = 3;
  private tpoAtonement = 0;
  private tpoDirect = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.THE_PENITENT_ONE.bonusID);
    if (!this.active) {
      return;
    }

    this.expectedBolts = this.selectedCombatant.hasTalent(SPELLS.CASTIGATION_TALENT.id) ? 4 : 3;
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtone);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_HEAL), this.onHeal);
    console.log('active');
  }

  onAtone(event: AtonementAnalyzerEvent) {
    const { penanceBoltNumber } = event.damageEvent as DirtyDamageEvent;
    if (typeof penanceBoltNumber !== 'number') return;
    if (penanceBoltNumber + 1 <= this.expectedBolts) return;

    this.tpoAtonement += event.healEvent.amount;
  }

  onHeal(event: HealEvent) {
    const { penanceBoltNumber } = event as DirtyHealEvent;
    if (typeof penanceBoltNumber !== 'number') return;
    if (penanceBoltNumber + 1 <= this.expectedBolts) return;

    this.tpoDirect += event.amount;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <strong>Atonement Healing:</strong> {formatThousands(this.tpoAtonement)}
            <br />
            <strong>Direct Healing:</strong> {formatThousands(this.tpoDirect)}
            <br />
          </>
        }
      >
        <>
          <BoringSpellValueText spell={SPELLS.THE_PENITENT_ONE}>
            <ItemHealingDone amount={this.tpoAtonement + this.tpoDirect} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default ThePenitentOne;
