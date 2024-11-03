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

import { ARCHON_RESONANT_ENERGY_MULTIPLIER } from '../../../constants';

class ResonantEnergy extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  damageResonantEnergy = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.RESONANT_ENERGY_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.checkAmpDamage);
  }

  checkAmpDamage(event: DamageEvent) {
    //Damage from Resonant Energy
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }

    //Potential Performance issue due to the following:
    const ampRE =
      target.getBuffStacks(SPELLS.SHADOW_PRIEST_ARCHON_RESONANT_ENERGY_DEBUFF.id) *
      ARCHON_RESONANT_ENERGY_MULTIPLIER;
    this.damageResonantEnergy += calculateEffectiveDamage(event, ampRE);
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.HERO_TALENTS}>
        <BoringSpellValueText spell={TALENTS.RESONANT_ENERGY_TALENT}>
          <ItemDamageDone amount={this.damageResonantEnergy} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ResonantEnergy;
