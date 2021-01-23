import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { formatPercentage, formatThousands } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class CircleOfHealing extends Analyzer {
  circleOfHealingCasts = 0;
  circleOfHealingHealing = 0;
  circleOfHealingOverhealing = 0;
  circleOfHealingTargetsHit = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CIRCLE_OF_HEALING_TALENT), this.onCohCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CIRCLE_OF_HEALING_TALENT), this.onCohHeal);
  }

  get overHealPercent() {
    return this.circleOfHealingOverhealing / this.rawHealing;
  }

  get rawHealing() {
    return this.circleOfHealingHealing + this.circleOfHealingOverhealing;
  }

  get averageTargetsHit() {
    return this.circleOfHealingTargetsHit / this.circleOfHealingCasts;
  }

  onCohCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CIRCLE_OF_HEALING_TALENT.id) {
      this.circleOfHealingCasts += 1;
    }
  }

  onCohHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CIRCLE_OF_HEALING_TALENT.id) {
      this.circleOfHealingTargetsHit += 1;
      this.circleOfHealingHealing += event.amount || 0;
      this.circleOfHealingOverhealing += event.overheal || 0;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={(
          <>
            Coh Casts: {this.circleOfHealingCasts}<br />
            Total Healing: {formatThousands(this.circleOfHealingHealing)} ({formatPercentage(this.overHealPercent)}% OH)<br />
            Average Targets Hit: {this.averageTargetsHit.toFixed(2)}
          </>
        )}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        position={STATISTIC_ORDER.OPTIONAL(5)}
      >
        <BoringSpellValueText spell={SPELLS.CIRCLE_OF_HEALING_TALENT}>
          <ItemHealingDone amount={this.circleOfHealingHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CircleOfHealing;
