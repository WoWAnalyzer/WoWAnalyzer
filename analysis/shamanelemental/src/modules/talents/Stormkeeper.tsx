import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import React from 'react';

const AFFECTED_ABILITIES = [
  SPELLS.LIGHTNING_BOLT_OVERLOAD,
  SPELLS.LIGHTNING_BOLT,
  SPELLS.CHAIN_LIGHTNING_OVERLOAD,
  SPELLS.CHAIN_LIGHTNING,
];

class Stormkeeper extends Analyzer {
  damageDoneByBuffedCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STORMKEEPER_TALENT_ELEMENTAL.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_ABILITIES),
      this.onSKDamage,
    );
  }

  onSKDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STORMKEEPER_TALENT_ELEMENTAL.id)) {
      return;
    }

    this.damageDoneByBuffedCasts += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} size="flexible">
        <BoringSpellValueText spellId={SPELLS.STORMKEEPER_TALENT_ELEMENTAL.id}>
          <>
            <ItemDamageDone amount={this.damageDoneByBuffedCasts} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stormkeeper;
