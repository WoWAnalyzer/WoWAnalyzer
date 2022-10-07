import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Haste from 'parser/shared/modules/Haste';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const HOT_HAND = {
  INCREASE: 1.0,
  MOD_RATE: 4.0,
};

/**
 * Melee auto-attacks with Flametongue Weapon active have a 5% chance to
 * reduce the cooldown of Lava Lash by 75% and increase the damage of
 * Lava Lash by 100% for 8 sec.
 *
 * Example Log:
 *
 */
class HotHand extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    haste: Haste,
  };
  protected spellUsable!: SpellUsable;
  protected haste!: Haste;

  protected buffedLavaLashDamage: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.HOT_HAND_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_HAND_BUFF),
      this.applyHotHand,
    );

    // Very unlikely to happen but it does.
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_HAND_BUFF),
      this.applyHotHand,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_HAND_BUFF),
      this.removeHotHand,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LAVA_LASH),
      this.onLavaLashDamage,
    );
  }

  applyHotHand() {
    // on application both resets the CD and applies a mod rate
    this.spellUsable.endCooldown(SPELLS.LAVA_LASH.id);
    this.spellUsable.applyCooldownRateChange(SPELLS.LAVA_LASH.id, HOT_HAND.MOD_RATE);
  }

  removeHotHand() {
    this.spellUsable.removeCooldownRateChange(SPELLS.LAVA_LASH.id, HOT_HAND.MOD_RATE);
  }

  onLavaLashDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HOT_HAND_BUFF.id)) {
      return;
    }

    this.buffedLavaLashDamage += calculateEffectiveDamage(event, HOT_HAND.INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS_SHAMAN.HOT_HAND_TALENT.id}>
          <>
            <ItemDamageDone amount={this.buffedLavaLashDamage} />
            <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HotHand;
