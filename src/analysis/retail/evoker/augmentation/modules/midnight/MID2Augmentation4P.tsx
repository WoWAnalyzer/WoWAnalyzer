import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { MID2_AUGMENTATION_4PC_DAMAGE_MULTIPLIER } from '../../constants';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
//import { TIERS } from 'game/TIERS';
import { formatNumber } from 'common/format';
import SpellLink from 'interface/SpellLink';

/**
 * (4) Set Augmentation: Upheaval increases the damage and healing dealt by Fate Mirror by 200% for 8 sec.
 */
class MID2Augmentation4P extends Analyzer {
  extraDamage = 0;

  constructor(options: Options) {
    super(options);
    //this.active = this.selectedCombatant.has4PieceByTier(TIERS.MID2);
    this.active = true; // Temporary
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FATE_MIRROR_DAMAGE),
      this.onDamage,
      // Healing not included as Prescience will usually be going on DPS.
    );
  }

  onDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.MAGNIFIED_FATE_BUFF.id)) {
      this.extraDamage += calculateEffectiveDamage(event, MID2_AUGMENTATION_4PC_DAMAGE_MULTIPLIER);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.extraDamage)}</li>
          </>
        }
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.FATE_MIRROR_TALENT} /> damage from tier
          </label>
          <ItemDamageDone amount={this.extraDamage} />
        </div>
      </Statistic>
    );
  }
}

export default MID2Augmentation4P;
