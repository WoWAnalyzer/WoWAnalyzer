import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import { SpellLink } from 'interface';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When } from 'parser/core/ParseResults';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

class GlacialFragments extends Analyzer {

  hasSplittingIce: boolean;
  fragmentDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.GLACIAL_FRAGMENTS.bonusID);
    this.hasSplittingIce = this.selectedCombatant.hasTalent(SPELLS.SPLITTING_ICE_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GLACIAL_FRAGMENTS_DAMAGE), this.onFragmentDamage);
  }

  onFragmentDamage(event: DamageEvent) {
    this.fragmentDamage += event.amount + (event.absorbed || 0);
  }

  suggestions(when: When) {
      when(this.hasSplittingIce).isFalse()
        .addSuggestion((suggest) => suggest(<>It is highly recommended to talent into <SpellLink id={SPELLS.SPLITTING_ICE_TALENT.id} /> when using the <SpellLink id={SPELLS.GLACIAL_FRAGMENTS.id} /> legendary effect. Without Splitting Ice, you would be better off using a different legendary effect instead.</>)
            .icon(SPELLS.GLACIAL_FRAGMENTS.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.REGULAR));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.GLACIAL_FRAGMENTS}>
          <ItemDamageDone amount={this.fragmentDamage} /><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GlacialFragments;
