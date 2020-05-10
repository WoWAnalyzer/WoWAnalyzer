import React from 'react';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';

import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import AverageTargetsHit
  from 'interface/others/AverageTargetsHit';

class Sundering extends Analyzer {

  /**
   * Shatters a line of earth in front of you with your main hand weapon,
   * causing (187.2% of Attack power) Flamestrike damage
   * and Incapacitating any enemy hit for 2 sec.
   *
   * Example Log:
   */

  protected damageGained = 0;
  protected casts = 0;
  protected hits = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      SPELLS.SUNDERING_TALENT.id,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(SPELLS.SUNDERING_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.SUNDERING_TALENT),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.hits += 1;
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }


  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={'TALENTS'}
      >
        <BoringSpellValueText spell={SPELLS.SUNDERING_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} /><br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Sundering;
