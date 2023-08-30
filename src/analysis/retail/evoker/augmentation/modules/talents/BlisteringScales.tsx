import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { ApplyBuffStackEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { REACTIVE_HIDE_MULTIPLIER } from '../../constants';
import { chitinBuffStackGained } from '../normalizers/CastLinkNormalizer';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import DonutChart from 'parser/ui/DonutChart';
import { SpellLink } from 'interface';

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
 * Blistering Scales has 5 more scales, and casting Eruption restores 1 scale.
 *
 * 3. Molten Blood:
 * When cast, Blistering Scales grants the target a shield that absorbs damage for 30 sec
 * based on their missing health. Lower health targets gain a larger shield.
 */
class BlisteringScales extends Analyzer {
  blisteringScalesDamage: number = 0;

  hasReactiveHide: boolean = false;
  reactiveHideStacks: number = 0;
  reactiveHideDamage: number = 0;
  totalStacks: number = 0;
  onHitCount: number = 0;

  hasRegenerativeChitin: boolean = false;
  stacksGained: number = 0;
  stacksWasted: number = 0;

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
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ERUPTION_TALENT),
      this.onCast,
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
    this.reactiveHideDamage += calculateEffectiveDamage(
      event,
      this.reactiveHideStacks * REACTIVE_HIDE_MULTIPLIER,
    );
    this.blisteringScalesDamage += event.amount + (event.absorbed ?? 0);
    this.onHitCount += 1;
    this.totalStacks += this.reactiveHideStacks;
  }

  onCast(event: CastEvent) {
    if (!this.hasRegenerativeChitin) {
      return;
    }
    if (chitinBuffStackGained(event)) {
      this.stacksGained += 1;
    } else {
      this.stacksWasted += 1;
    }
  }

  statistic() {
    const averageStacks = this.totalStacks / this.onHitCount;
    const damageSources = [
      {
        color: 'rgb(123,188,93)',
        label: 'Stacks gained',
        valueTooltip: formatNumber(this.stacksGained),
        value: this.stacksGained,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Stacks wasted',
        valueTooltip: formatNumber(this.stacksWasted),
        value: this.stacksWasted,
      },
    ];
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.reactiveHideDamage + this.blisteringScalesDamage)}</li>
            {this.hasReactiveHide && <li>Average Stacks: {averageStacks.toFixed(2)}</li>}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.BLISTERING_SCALES_TALENT}>
          <ItemDamageDone amount={this.blisteringScalesDamage - this.reactiveHideDamage} />
        </TalentSpellText>

        {this.hasReactiveHide && (
          <TalentSpellText talent={TALENTS.REACTIVE_HIDE_TALENT}>
            <ItemDamageDone amount={this.reactiveHideDamage} />
          </TalentSpellText>
        )}

        {this.hasRegenerativeChitin && (
          <div className="pad">
            <SpellLink spell={TALENTS.REGENERATIVE_CHITIN_TALENT} />
            <DonutChart items={damageSources} />
          </div>
        )}
      </Statistic>
    );
  }
}

export default BlisteringScales;
