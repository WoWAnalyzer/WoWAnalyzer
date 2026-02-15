import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Enemies from 'parser/shared/modules/Enemies';

import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';

import Events, { DamageEvent } from 'parser/core/Events';

import { ARCHON_PERFECTED_FORM_VOIDFORM_MULTIPLIER } from '../../../constants';

class PerfectedForm extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  damagePerfectedForm = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PERFECTED_FORM_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.checkAmpDamage);
  }

  checkAmpDamage(event: DamageEvent) {
    //Damage from Perfected Form
    //For VF
    if (this.selectedCombatant.hasBuff(SPELLS.VOIDFORM_BUFF.id)) {
      this.damagePerfectedForm += calculateEffectiveDamage(
        event,
        ARCHON_PERFECTED_FORM_VOIDFORM_MULTIPLIER,
      );
    }
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.HERO_TALENTS}>
        <BoringSpellValueText spell={TALENTS.PERFECTED_FORM_TALENT}>
          <ItemDamageDone amount={this.damagePerfectedForm} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PerfectedForm;
