import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { GROWING_INFERNO_DAMAGE_INCREASE } from '@wowanalyzer/demonhunter';

/**
 * Example logs
 * Rank 5: https://www.warcraftlogs.com/reports/aW8GMv69NBY2CxbK#fight=1&type=damage-done&source=13
 * Rank 4: https://www.warcraftlogs.com/reports/nwRNF864JYTCkW3P#fight=80&type=damage-done&source=175
 */

class GrowingInferno extends Analyzer {
  conduitRank: number = 0;
  addedDamage: number = 0;
  ImmolationDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.GROWING_INFERNO.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.GROWING_INFERNO.id);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.IMMOLATION_AURA_INITIAL_HIT_DAMAGE, SPELLS.IMMOLATION_AURA_BUFF_DAMAGE]),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.ImmolationDamage += event.amount + (event.absorbed || 0);
    this.addedDamage += calculateEffectiveDamage(
      event,
      GROWING_INFERNO_DAMAGE_INCREASE[this.conduitRank],
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={<>Total damage of Immolation Aura {formatThousands(this.ImmolationDamage)}</>}
      >
        <ConduitSpellText spell={SPELLS.GROWING_INFERNO} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default GrowingInferno;
