import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Enemies from 'parser/shared/modules/Enemies';
import InsanityIcon from 'interface/icons/Insanity';
import { SpellLink } from 'interface';

import TALENTS from 'common/TALENTS/priest';

import Events from 'parser/core/Events';

class ManifestedPower extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  gainSurgeofInsanity = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.MANIFESTED_POWER_TALENT);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.HALO_SHADOW_TALENT),
      this.onHalo,
    );
  }

  onHalo() {
    this.gainSurgeofInsanity += 1;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.HERO_TALENTS}>
        <BoringSpellValueText spell={TALENTS.MANIFESTED_POWER_TALENT}>
          <InsanityIcon /> <>{this.gainSurgeofInsanity}</>{' '}
          <small>
            extra <SpellLink spell={TALENTS.SURGE_OF_INSANITY_TALENT} /> procs
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ManifestedPower;
