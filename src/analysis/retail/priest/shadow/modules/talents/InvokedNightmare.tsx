import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { INVOKED_NIGHTMARE_DAMAGE_PER_RANK } from '../../constants';

class InvokedNightmare extends Analyzer {
  damage = 0;

  multiplierInvokedNightmare =
    this.selectedCombatant.getTalentRank(TALENTS.INVOKED_NIGHTMARE_TALENT) *
    INVOKED_NIGHTMARE_DAMAGE_PER_RANK;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INVOKED_NIGHTMARE_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_WORD_PAIN),
      this.onSWPDamage,
    );
  }

  onSWPDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, this.multiplierInvokedNightmare);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.INVOKED_NIGHTMARE_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default InvokedNightmare;
