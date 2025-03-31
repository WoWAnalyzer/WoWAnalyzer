import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { BLEEDS, cdSpell } from 'analysis/retail/druid/feral/constants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import Enemies from 'parser/shared/modules/Enemies';
import Enemy from 'parser/core/Enemy';

const SHRED_BONUS = 0.2;
const SWIPE_BONUS = 0.15;
const FRENZY_MULTIPLIER = 2.5;

/**
 * *Merciless Claws*
 * Spec Talent
 *
 * Shred deals 20% increased damage and [Brutal Slash / Swipe] deals 15% increased damage against bleeding targets.
 */
export default class MercilessClaws extends Analyzer.withDependencies({ enemies: Enemies }) {
  /** Total damage added by Merciless Claws */
  damage = 0;

  hasBerserkFrenzy: boolean;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.MERCILESS_CLAWS_TALENT);
    this.hasBerserkFrenzy = this.selectedCombatant.hasTalent(TALENTS_DRUID.BERSERK_FRENZY_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHRED),
      this.onShredDamage,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.SWIPE_CAT, TALENTS_DRUID.BRUTAL_SLASH_TALENT]),
      this.onSwipeDamage,
    );
  }

  onShredDamage(event: DamageEvent) {
    this.onMcDamage(event, SHRED_BONUS);
  }

  onSwipeDamage(event: DamageEvent) {
    this.onMcDamage(event, SWIPE_BONUS);
  }

  onMcDamage(event: DamageEvent, bonus: number) {
    if (!this.isTargetBleeding(event)) {
      return;
    }
    let attributableDamage = calculateEffectiveDamage(event, bonus);
    if (this.hasBerserkFrenzy && this.selectedCombatant.hasBuff(cdSpell(this.selectedCombatant))) {
      attributableDamage *= FRENZY_MULTIPLIER;
    }
    this.damage += attributableDamage;
  }

  private isTargetBleeding(event: DamageEvent): boolean {
    const enemy: Enemy | null = this.deps.enemies.getEntity(event);
    if (!enemy) {
      console.warn('Damage to untracked entity...');
      return false;
    }
    return BLEEDS.some((bleed) => enemy.hasOwnBuff(bleed));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This statistic checks if target hit was bleeding
            {this.hasBerserkFrenzy && (
              <>
                {' '}
                and estimates attribution due to stronger{' '}
                <SpellLink spell={TALENTS_DRUID.BERSERK_FRENZY_TALENT} /> bleed
              </>
            )}
            .
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.MERCILESS_CLAWS_TALENT}>
          <ItemPercentDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
