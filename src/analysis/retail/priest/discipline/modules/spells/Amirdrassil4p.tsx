import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { getDamageEvent } from '../../normalizers/AtonementTracker';
import { TIERS } from 'game/TIERS';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import ItemSetLink from 'interface/ItemSetLink';
import { PRIEST_T31_ID } from 'common/ITEMS/dragonflight';

class Amirdrassil4p extends Analyzer {
  shadowSmiteHealing = 0;
  shadowSmiteDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T31);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onAtoneHeal,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.SHADOW_SMITE]),
      this.onDamage,
    );
  }

  onAtoneHeal(event: HealEvent) {
    if (!getDamageEvent(event)) {
      return;
    }
    const damageEvent = getDamageEvent(event);

    if (damageEvent?.ability.guid === SPELLS.SHADOW_SMITE.id) {
      this.shadowSmiteHealing += event.amount;
    }
  }

  onDamage(event: DamageEvent) {
    if (event.ability.guid === SPELLS.SHADOW_SMITE.id) {
      this.shadowSmiteDamage += event.amount;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <SpellLink spell={SPELLS.SHADOW_SMITE.id} /> is cast by the 4-piece bonus of Amirdrassil
            tier.
          </>
        }
      >
        <>
          <div className="pad boring-text">
            <label>
              <ItemSetLink id={PRIEST_T31_ID}>
                <>
                  The Furnace Seraph's Verdict
                  <br />
                  (Amirdrassil Tier 4p)
                </>
              </ItemSetLink>
            </label>
            <div className="value">
              <ItemHealingDone amount={this.shadowSmiteHealing} /> <br />
              <ItemDamageDone amount={this.shadowSmiteDamage} />
            </div>
          </div>
        </>
      </Statistic>
    );
  }
}

export default Amirdrassil4p;
