import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

import { HAUNTING_APPARITIONS_DAMAGE_INCREASE } from '@wowanalyzer/priest-shadow/src/constants';

class HauntingApparitions extends Analyzer {
  conduitRank = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.HAUNTING_APPARITIONS.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(
      event,
      HAUNTING_APPARITIONS_DAMAGE_INCREASE[this.conduitRank],
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <Trans id="priest.shadow.conduits.hauntingApparitions.tooltip">
            This is the bonus damage gained from the conduit.
            <br />
            <br />
            Total damage: {formatNumber(this.damage)}
          </Trans>
        }
      >
        <ConduitSpellText spellId={SPELLS.HAUNTING_APPARITIONS.id} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default HauntingApparitions;
