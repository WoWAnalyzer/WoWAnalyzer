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

import { ARCHON_EMPOWERED_SURGES_MULTIPLIER } from '../../../constants';

class EmpoweredSurges extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  damageEmpoweredSurges = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.EMPOWERED_SURGES_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onSurgeOfInsanity,
    );
  }

  //Damage from Empowered Surges
  onSurgeOfInsanity(event: DamageEvent) {
    this.damageEmpoweredSurges += calculateEffectiveDamage(
      event,
      ARCHON_EMPOWERED_SURGES_MULTIPLIER,
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.HERO_TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.EMPOWERED_SURGES_TALENT}>
          <ItemDamageDone amount={this.damageEmpoweredSurges} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EmpoweredSurges;
