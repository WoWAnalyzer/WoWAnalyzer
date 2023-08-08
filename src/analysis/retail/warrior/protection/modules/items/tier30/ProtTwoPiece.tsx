import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';

const REDUCTION = 2000;
const SHIELD_SLAM_DAMAGE_AMP = 0.15;
const LAST_STAND_MULTPLIER = 2;

/**
 * Whenever you cast a shield slam reduce shield wall by 2 second and increase Shield slams damage by 15%
 * when you have last stand up, double it
 */
class ImpenetrableWall extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  effectiveCDR = 0;
  wastedCDR = 0;

  increasedDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T30);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM), this.onCast);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM),
      this.onDamage,
    );
  }

  onCast(event: CastEvent) {
    const effectMultiplilier = this.selectedCombatant.hasBuff(SPELLS.LAST_STAND.id)
      ? LAST_STAND_MULTPLIER
      : 1;
    const effectiveReduction = REDUCTION * effectMultiplilier;

    if (this.spellUsable.isOnCooldown(SPELLS.SHIELD_WALL.id)) {
      const cdr = this.spellUsable.reduceCooldown(SPELLS.SHIELD_WALL.id, effectiveReduction);
      this.effectiveCDR += cdr;
      this.wastedCDR += effectiveReduction - cdr;
    } else {
      this.wastedCDR += effectiveReduction;
    }
  }

  onDamage(event: DamageEvent) {
    const effectMultiplilier = this.selectedCombatant.hasBuff(SPELLS.LAST_STAND.id)
      ? LAST_STAND_MULTPLIER
      : 1;
    this.increasedDamage += calculateEffectiveDamage(
      event,
      SHIELD_SLAM_DAMAGE_AMP * effectMultiplilier,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<></>}
      >
        <BoringValueText label="Fangs of the Vermillion Forge 2 Piece (T30 Set Bonus)">
          <ItemCooldownReduction effective={this.effectiveCDR} waste={this.wastedCDR} /> <br />
          <ItemDamageDone amount={this.increasedDamage} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default ImpenetrableWall;
