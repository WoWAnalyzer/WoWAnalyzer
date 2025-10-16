import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { T35_AUGMENTATION_2PC_DAMAGE_MULTIPLIER } from '../../constants';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
//import { TIERS } from 'game/TIERS';
import { formatNumber } from 'common/format';
import SpellLink from 'interface/SpellLink';

/**
 * (2) Set Augmentation: Eruption deals 15% increased damage and extends Ebon Might by an additional 0.5 sec.
 */
class T35Augmentation2P extends Analyzer {
  extraDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = false;
    //this.active = this.selectedCombatant.has2PieceByTier(TIERS.MIDNIGHT1);
    //Midnight tiers not implemented yet
    //Update EbonMight.tsx as well when implemented
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([TALENTS.ERUPTION_TALENT, SPELLS.MASS_ERUPTION_DAMAGE]),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.extraDamage += calculateEffectiveDamage(event, T35_AUGMENTATION_2PC_DAMAGE_MULTIPLIER);
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
            <SpellLink spell={TALENTS.ERUPTION_TALENT} /> damage from tier
          </label>
          <ItemDamageDone amount={this.extraDamage} />
        </div>
      </Statistic>
    );
  }
}

export default T35Augmentation2P;
