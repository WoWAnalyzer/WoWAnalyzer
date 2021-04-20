import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { DamageEvent, Ability } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../../core/AtonementAnalyzer';
import ClaritySourceDonut from './ClaritySourceDonut';

const CLARITY_EXTENSION_DURATION = 3000;

class ClarityOfMind extends Analyzer {
  private atonementHealing: number = 0;
  private healingMap: Map<number, number> = new Map();
  private abilityMap: Map<number, Ability> = new Map();

  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.hasLegendaryByBonusID(SPELLS.CLARITY_OF_MIND.bonusID) &&
      this.selectedCombatant.hasTalent(SPELLS.SPIRIT_SHELL_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleAtone);
  }

  /**
   * Handles associating atonement values with the Spirit Shell extension
   */
  private handleAtone(event: AtonementAnalyzerEvent) {
    const { expirationDelta } = event;

    if (!expirationDelta) {
      return;
    }

    if (expirationDelta > 0 || expirationDelta < -CLARITY_EXTENSION_DURATION) {
      return;
    }

    this.attributeToMap(event.healEvent.amount, event.damageEvent);
    this.atonementHealing += event.healEvent.amount;
  }

  private attributeToMap(amount: number, sourceEvent?: DamageEvent) {
    if (!sourceEvent) {
      return;
    }
    const { ability } = sourceEvent;

    // Set ability in map
    this.abilityMap.set(ability.guid, ability);

    // Attribute healing
    const currentValue = this.healingMap.get(ability.guid) || 0;
    this.healingMap.set(ability.guid, currentValue + amount);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <>
          <BoringSpellValueText spell={SPELLS.CLARITY_OF_MIND}>
            <ItemHealingDone amount={this.atonementHealing} />
          </BoringSpellValueText>
          <ClaritySourceDonut abilityMap={this.abilityMap} healingMap={this.healingMap} />
        </>
      </Statistic>
    );
  }
}

export default ClarityOfMind;
