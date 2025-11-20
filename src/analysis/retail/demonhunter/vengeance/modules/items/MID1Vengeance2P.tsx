import SPELLS from 'common/SPELLS/demonhunter';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { MID1_2PC_DAMAGE_MULTIPLIER } from '../../constants';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { TIERS } from 'game/TIERS';

/**
 * (2) Set Vengeance: Fracture damage increased by 30%.
 */

class MID1Vengeance2P extends Analyzer {
  extraDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.MID1);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FRACTURE_MAIN_HAND),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FRACTURE_OFF_HAND),
      this.onDamage,
    );
  }
  onDamage(event: DamageEvent) {
    this.extraDamage += calculateEffectiveDamage(event, MID1_2PC_DAMAGE_MULTIPLIER);
  }
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.FRACTURE}>
          <ItemDamageDone amount={this.extraDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MID1Vengeance2P;
