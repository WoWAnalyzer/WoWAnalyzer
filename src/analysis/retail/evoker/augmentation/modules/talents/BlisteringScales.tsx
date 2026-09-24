import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { ApplyBuffStackEvent, DamageEvent } from 'parser/core/Events';
import { REACTIVE_HIDE_MULTIPLIER, REGENERATIVE_CHITIN_MULTIPLIER } from '../../constants';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { InformationIcon } from 'interface/icons';

/**
 * Blistering Scales is essentially Augmentations external
 * it provides your target with 30% of your armor along with doing AoE
 * to nearby enemies when said target is meleed. Consuming 1 stack.
 * This effect has an ICD of ~2s
 *
 * There are three supporting talents to Blistering Scales:
 * 1. Reactive Hide:
 * Each time Blistering Scales explodes it deals 10% more damage for 12 sec, stacking 10 times.
 *
 * 2. Regenerative Chitin:
 * Blistering Scales no longer loses stacks and deals 20% additional damage.
 *
 * 3. Molten Blood:
 * When cast, Blistering Scales grants the target a shield that absorbs damage for 30 sec
 * based on their missing health. Lower health targets gain a larger shield.
 */
class BlisteringScales extends Analyzer {
  blisteringScalesDamage = 0;

  hasReactiveHide = false;
  reactiveHideStacks = 0;
  reactiveHideDamage = 0;
  regenerativeChitinDamage = 0;
  totalStacks = 0;
  onHitCount = 0;

  hasRegenerativeChitin = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLISTERING_SCALES_TALENT);
    this.hasReactiveHide = this.selectedCombatant.hasTalent(TALENTS.REACTIVE_HIDE_TALENT);
    this.hasRegenerativeChitin = this.selectedCombatant.hasTalent(
      TALENTS.REGENERATIVE_CHITIN_TALENT,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLISTERING_SCALES_DAM),
      this.onHit,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REACTIVE_HIDE_BUFF),
      this.onApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.REACTIVE_HIDE_BUFF),
      this.onStackGain,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.REACTIVE_HIDE_BUFF),
      this.onRemove,
    );
  }

  onApply() {
    this.reactiveHideStacks = 1;
  }

  onRemove() {
    this.reactiveHideStacks = 0;
  }

  onStackGain(event: ApplyBuffStackEvent) {
    this.reactiveHideStacks = event.stack;
  }

  onHit(event: DamageEvent) {
    // Damage is manually calculated as calculateEffectiveDamage requires an event passed,
    // but we want to split the damage three ways into Blistering/Chitin/Reactive.
    let damageAmountRemaining = event.amount + (event.absorbed ?? 0);
    // Subtract Reactive first
    // Chitin has to be pathed through to get to Reactive, so it makes no sense
    // to have its damage number "increased" by then taking Reactive.
    const reactiveDamage =
      damageAmountRemaining -
      damageAmountRemaining / (1 + this.reactiveHideStacks * REACTIVE_HIDE_MULTIPLIER);
    this.reactiveHideDamage += reactiveDamage;
    damageAmountRemaining -= reactiveDamage;
    // Subtract Chitin
    if (this.hasRegenerativeChitin) {
      const chitinDamage =
        damageAmountRemaining - damageAmountRemaining / (1 + REGENERATIVE_CHITIN_MULTIPLIER);
      this.regenerativeChitinDamage += chitinDamage;
      damageAmountRemaining -= chitinDamage;
    }
    // Remaining damage is base Blistering Scales
    this.blisteringScalesDamage += damageAmountRemaining;
    this.onHitCount += 1;
    this.totalStacks += this.reactiveHideStacks;
  }

  statistic() {
    const averageStacks = this.totalStacks / this.onHitCount;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>
              Total damage:{' '}
              {formatNumber(
                this.reactiveHideDamage +
                  this.blisteringScalesDamage +
                  this.regenerativeChitinDamage,
              )}
            </li>
            <li>
              Overall{' '}
              <ItemDamageDone
                amount={
                  this.reactiveHideDamage +
                  this.blisteringScalesDamage +
                  this.regenerativeChitinDamage
                }
              />
            </li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.BLISTERING_SCALES_TALENT}>
          <ItemDamageDone amount={this.blisteringScalesDamage} />
        </TalentSpellText>

        {this.hasRegenerativeChitin && (
          <TalentSpellText talent={TALENTS.REGENERATIVE_CHITIN_TALENT}>
            <ItemDamageDone amount={this.regenerativeChitinDamage} />
          </TalentSpellText>
        )}

        {this.hasReactiveHide && (
          <TalentSpellText talent={TALENTS.REACTIVE_HIDE_TALENT}>
            <ItemDamageDone amount={this.reactiveHideDamage} />
            <div>
              <InformationIcon /> {averageStacks.toFixed(2)}
              <small> average stacks</small>
            </div>
          </TalentSpellText>
        )}
      </Statistic>
    );
  }
}

export default BlisteringScales;
