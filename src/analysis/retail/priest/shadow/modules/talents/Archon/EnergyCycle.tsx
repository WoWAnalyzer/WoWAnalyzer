import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Enemies from 'parser/shared/modules/Enemies';

import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';

import Events from 'parser/core/Events';

class EnergyCycle extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  spirtsEnergyCycle = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.ENERGY_CYCLE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onSurgeOfInsanity,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE),
      this.onSurgeOfInsanity,
    );
  }

  //Spirits from Energy Cycles
  onSurgeOfInsanity() {
    this.spirtsEnergyCycle += 1;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.HERO_TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.ENERGY_CYCLE_TALENT}>
          <div>
            <>{this.spirtsEnergyCycle}</> <small>extra spirits</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EnergyCycle;
