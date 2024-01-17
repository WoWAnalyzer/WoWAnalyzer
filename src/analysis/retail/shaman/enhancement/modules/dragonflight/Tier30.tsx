import { SHAMAN_T30_ID } from 'common/ITEMS/dragonflight';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { formatNumber, formatPercentage } from 'common/format';
import MAGIC_SCHOOLS, { isMatchingDamageType } from 'game/MAGIC_SCHOOLS';
import { TIERS } from 'game/TIERS';
import { SpellLink } from 'interface';
import ItemSetLink from 'interface/ItemSetLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import Abilities from 'parser/core/modules/Abilities';

const ADDITIONAL_DAMAGE_RATIO = {
  FIRE: 0.2,
  PHYSICAL: 0.2,
  CHAIN_LIGHTNING: 0.2,
};

class Tier30 extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  protected abilities!: Abilities;
  protected extraChainLightningDamage = 0;
  protected extraPhysicalDamge = 0;
  protected extraFireDamage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T30);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_LIGHTNING_TALENT),
      this.onChainLightning,
    );
  }

  get extraDamage() {
    return this.extraChainLightningDamage + this.extraPhysicalDamge + this.extraFireDamage;
  }

  get extraDamagePercentage() {
    return this.owner.getPercentageOfTotalDamageDone(this.extraDamage);
  }

  get totalExtraDps() {
    return this.extraDamage / (this.owner.fightDuration / 1000);
  }

  onDamage(event: DamageEvent) {
    const ability =
      event.ability.guid === SPELLS.MELEE.id
        ? SPELLS.MELEE
        : this.abilities.getAbility(event.ability.guid);
    if (!ability || event.ability.guid === SPELLS.PRIMORDIAL_WAVE_DAMAGE.id) {
      // primordial wave is elemental damage but not increased by the tier set
      return;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.VOLCANIC_STRENGTH_TIER_BUFF.id)) {
      /** Volcanic Strength "double-dips" on multi-school spells, e.g. Sundering deals
       * flamestrike damage and is increased by both the physical AND fire components of the buff */
      if (isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.PHYSICAL)) {
        this.extraPhysicalDamge += calculateEffectiveDamage(
          event,
          ADDITIONAL_DAMAGE_RATIO.PHYSICAL,
        );
      }
      if (isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.FIRE)) {
        this.extraFireDamage += calculateEffectiveDamage(event, ADDITIONAL_DAMAGE_RATIO.FIRE);
      }
    }
  }

  onChainLightning(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.CRACKLING_THUNDER_TIER_BUFF.id)) {
      this.extraChainLightningDamage += calculateEffectiveDamage(
        event,
        ADDITIONAL_DAMAGE_RATIO.CHAIN_LIGHTNING,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            <SpellLink spell={SPELLS.VOLCANIC_STRENGTH_TIER_BUFF} />
            <ul>
              <li>
                Physical damage: <strong>{formatNumber(this.extraPhysicalDamge)}</strong> (
                {formatPercentage(
                  this.owner.getPercentageOfTotalDamageDone(this.extraPhysicalDamge),
                )}
                %)
              </li>
              <li>
                Fire damage: <strong>{formatNumber(this.extraFireDamage)}</strong> (
                {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.extraFireDamage))}
                %)
              </li>
            </ul>
            {this.extraChainLightningDamage > 0 && (
              <>
                <SpellLink spell={SPELLS.CRACKLING_THUNDER_TIER_BUFF} />{' '}
                <small>does not include damage gained from refunded maelstrom</small>
                <ul>
                  <li>
                    Chain Lightning: <strong>{formatNumber(this.extraChainLightningDamage)}</strong>{' '}
                    (
                    {formatPercentage(
                      this.owner.getPercentageOfTotalDamageDone(this.extraChainLightningDamage),
                    )}
                    %)
                  </li>
                </ul>
                <small>NOTE: The damage gained from the 2-piece bonus is not included</small>
              </>
            )}
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={SHAMAN_T30_ID}>
              <>
                Runes of the Cinderwolf
                <br />
                (Tier-30 Set)
              </>
            </ItemSetLink>
          </label>
          <div className="value">
            <ItemDamageDone amount={this.extraDamage} />
          </div>
        </div>
      </Statistic>
    );
  }
}

export default Tier30;
