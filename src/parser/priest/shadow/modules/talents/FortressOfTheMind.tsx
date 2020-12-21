import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent, EnergizeEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/index';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { formatNumber } from 'common/format';
import Insanity from 'interface/icons/Insanity'

import { FORTRESS_OF_THE_MIND_DAMAGE_INCREASE, FORTRESS_OF_THE_MIND_INSANITY_INCREASE } from '../../constants';

const FORTRESS_ABILITIES = [
  SPELLS.MIND_FLAY,
  SPELLS.MIND_BLAST
];

class FortressOfTheMind extends Analyzer {

  damage: number = 0;
  insanity: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FORTRESS_OF_THE_MIND_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(FORTRESS_ABILITIES), this.onDamage);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(FORTRESS_ABILITIES), this.onEnergize);
  }

  onDamage(event: DamageEvent) {
    const raw = event.amount + (event.absorbed || 0);
    this.damage += raw - (raw / FORTRESS_OF_THE_MIND_DAMAGE_INCREASE);
  }

  onEnergize(event: EnergizeEvent) {
    this.insanity += event.resourceChange - (event.resourceChange / FORTRESS_OF_THE_MIND_INSANITY_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.FORTRESS_OF_THE_MIND_TALENT}>
          <>
          <ItemDamageDone amount={this.damage} /><br />
          <Insanity /> {formatNumber(this.insanity)} <small>insanity generated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FortressOfTheMind;
