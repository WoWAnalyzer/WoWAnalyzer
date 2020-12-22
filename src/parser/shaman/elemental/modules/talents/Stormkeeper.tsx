import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import Spell from 'common/SPELLS/Spell';

const AFFECTED_ABILITIES: Spell[] = [
  SPELLS.LIGHTNING_BOLT_OVERLOAD,
  SPELLS.LIGHTNING_BOLT,
  SPELLS.CHAIN_LIGHTNING_OVERLOAD,
  SPELLS.CHAIN_LIGHTNING,
];

class Stormkeeper extends Analyzer {
  damageDoneByBuffedCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STORMKEEPER_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_ABILITIES),
      this.onSKDamage,
    );
  }

  onSKDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STORMKEEPER_TALENT.id)) {
      return;
    }

    this.damageDoneByBuffedCasts += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.STORMKEEPER_TALENT}>
          <>
            <ItemDamageDone amount={this.damageDoneByBuffedCasts} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stormkeeper;
