import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';
import BoringValueText from 'parser/ui/BoringValueText';
import Enemies from 'parser/shared/modules/Enemies';
import { calculateEffectiveDamageReduction } from 'parser/core/EventCalculateLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemDamageTaken from 'parser/ui/ItemDamageTaken';

const DAMAGE_REDUCTION = 0.05;

class ImpenetrableWall extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  primaryTarget = 0;
  damageToPrimaryTarget = 0;
  cleaveDamage = 0;
  damageReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T30);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM), this.onCast);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EARTHEN_SMASH),
      this.onDamage,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onCast(event: CastEvent) {
    this.primaryTarget = event.targetID ?? this.primaryTarget;
  }

  onDamage(event: DamageEvent) {
    if (event.targetID === this.primaryTarget) {
      this.damageToPrimaryTarget += event.amount;
      return;
    }

    this.cleaveDamage += event.amount;
  }

  onDamageTaken(event: DamageEvent) {
    const enemy = this.enemies.getSourceEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.DEMORALIZING_SHOUT.id)) {
      this.damageReduction += calculateEffectiveDamageReduction(event, DAMAGE_REDUCTION);
    }
  }

  statistic() {
    const totalDamage = this.damageToPrimaryTarget + this.cleaveDamage;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Extra Damage to Primary Target: <ItemDamageDone amount={this.damageToPrimaryTarget} />
            <br />
            Extra Damage due to Cleave: <ItemDamageDone amount={this.cleaveDamage} />
            <br />
          </>
        }
      >
        <BoringValueText label="Heartfire Sentinel's Authority 4 Piece (T30 Set Bonus)">
          <ItemDamageDone amount={totalDamage} />
          <br />
          <ItemDamageTaken amount={this.damageReduction} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default ImpenetrableWall;
