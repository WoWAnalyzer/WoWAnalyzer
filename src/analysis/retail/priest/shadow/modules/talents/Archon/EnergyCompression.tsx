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

import { ARCHON_ENERGY_COMPRESSION_MULTIPLIER } from '../../../constants';

class EnergyCompression extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  damageHalo = 0;
  insanityHalo = 0;

  damageEnergyCompression = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_HALO_DAMAGE),
      this.onHalo,
    );
  }

  onHalo(event: DamageEvent) {
    this.damageHalo += event.amount + (event.absorbed || 0);

    //Damage from Energy Compression
    if (this.selectedCombatant.hasTalent(TALENTS.ENERGY_COMPRESSION_TALENT)) {
      this.damageEnergyCompression += calculateEffectiveDamage(
        event,
        ARCHON_ENERGY_COMPRESSION_MULTIPLIER,
      );
    }
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.HERO_TALENTS}>
        <BoringSpellValueText spell={TALENTS.HALO_SHADOW_TALENT}>
          <ItemDamageDone amount={this.damageHalo} />
        </BoringSpellValueText>
        {this.selectedCombatant.hasTalent(TALENTS.ENERGY_COMPRESSION_TALENT) && (
          <BoringSpellValueText spell={TALENTS.ENERGY_COMPRESSION_TALENT}>
            <ItemDamageDone amount={this.damageEnergyCompression} />
          </BoringSpellValueText>
        )}
      </Statistic>
    );
  }
}

export default EnergyCompression;
