import { ARCANE_CHARGE_MAX_STACKS } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent, DamageEvent, GetRelatedEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import ArcaneChargeTracker from './ArcaneChargeTracker';
import Enemies from 'parser/shared/modules/Enemies';

class ArcaneSurgePreReqs extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
    enemies: Enemies,
  };
  protected abilityTracker!: AbilityTracker;
  protected arcaneChargeTracker!: ArcaneChargeTracker;
  protected enemies!: Enemies;

  hasSiphonStorm: boolean = this.selectedCombatant.hasTalent(TALENTS.SIPHON_STORM_TALENT);
  hasTouchOfMagi: boolean = this.selectedCombatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT);
  hasRadiantSpark: boolean = this.selectedCombatant.hasTalent(TALENTS.RADIANT_SPARK_TALENT);

  arcaneSurges: {
    cast: CastEvent;
    radiantSparkActive: boolean | undefined;
    siphonStormActive: boolean | undefined;
    manaPercent: number;
    maxCharges: boolean;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ARCANE_SURGE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_SURGE_TALENT),
      this.onArcaneSurge,
    );
  }

  onArcaneSurge(event: CastEvent) {
    const damageEvent: DamageEvent | undefined = GetRelatedEvent(event, 'SpellDamage');
    const enemy = damageEvent && this.enemies.getEntity(damageEvent);
    const radiantSparkActive: boolean | undefined =
      this.selectedCombatant.hasBuff(TALENTS.RADIANT_SPARK_TALENT.id) &&
      ((enemy && !enemy.hasBuff(SPELLS.RADIANT_SPARK_INACTIVE_DEBUFF.id)) || undefined);
    const manaResource: any =
      event.classResources &&
      event.classResources.find((classResource) => classResource.type === RESOURCE_TYPES.MANA.id);

    this.arcaneSurges.push({
      cast: event,
      radiantSparkActive: this.hasRadiantSpark && radiantSparkActive,
      siphonStormActive:
        this.hasSiphonStorm && this.selectedCombatant.hasBuff(TALENTS.SIPHON_STORM_TALENT.id),
      manaPercent: manaResource && manaResource.amount / manaResource.max,
      maxCharges: this.arcaneChargeTracker.charges >= ARCANE_CHARGE_MAX_STACKS,
    });
  }

  badArcaneSurges = () => {
    let badCasts = 0;
    this.arcaneSurges.forEach((c) => {
      if (
        (this.hasRadiantSpark && !c.radiantSparkActive) ||
        (this.hasSiphonStorm && !c.siphonStormActive) ||
        !c.maxCharges
      ) {
        badCasts += 1;
      }
    });
    return badCasts;
  };

  get totalSurgeCasts() {
    return this.abilityTracker.getAbility(TALENTS.ARCANE_SURGE_TALENT.id).casts;
  }

  get averageManaPercent() {
    let mana = 0;
    this.arcaneSurges.forEach((c) => (mana += c.manaPercent));
    return mana / this.totalSurgeCasts;
  }

  get missingRadiantSpark() {
    return this.arcaneSurges.filter((c) => !c.radiantSparkActive).length;
  }

  get missingSiphonStorm() {
    return this.arcaneSurges.filter((c) => !c.siphonStormActive).length;
  }

  get notMaxCharges() {
    return this.arcaneSurges.filter((c) => !c.maxCharges).length;
  }

  get cooldownUtilization() {
    return 1 - this.badArcaneSurges() / this.totalSurgeCasts;
  }

  get arcaneSurgeThresholds() {
    return {
      actual: this.cooldownUtilization,
      isLessThan: {
        minor: 1,
        average: 0.8,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get radiantSparkThresholds() {
    return {
      actual: this.missingRadiantSpark,
      isGreaterThan: {
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get siphonStormThresholds() {
    return {
      actual: this.missingSiphonStorm,
      isGreaterThan: {
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.arcaneSurgeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> without proper setup{' '}
          {this.badArcaneSurges()} times. Arcane Surge has a short duration so you should get the
          most out of it by meeting all requirements before casting it.
          <ul>
            <li>
              You have {ARCANE_CHARGE_MAX_STACKS} <SpellLink spell={SPELLS.ARCANE_CHARGE} /> - You
              failed this {this.notMaxCharges} times.
            </li>
          </ul>
        </>,
      )
        .icon(TALENTS.ARCANE_SURGE_TALENT.icon)
        .actual(`{this.badArcaneSurges()} Bad Cooldown Uses`)
        .recommended(`0 is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(30)}
        tooltip={
          <>
            Before casting Arcane Surge, you should ensure that you meet all of the following
            requirements. If Arcane Surge frequently comes off cooldown and these requirements are
            not already met, then consider modifying your rotation to ensure that they are met
            before Arcane Surge comes off cooldown
            <ul>
              <li>
                You have {ARCANE_CHARGE_MAX_STACKS} Arcane Charges - Missed {this.notMaxCharges}{' '}
                times
              </li>
              {this.hasRadiantSpark && (
                <li>
                  <SpellLink spell={TALENTS.RADIANT_SPARK_TALENT} /> is active - Missed{' '}
                  {this.missingRadiantSpark} times
                </li>
              )}
              {this.hasSiphonStorm && (
                <li>
                  <SpellLink spell={TALENTS.SIPHON_STORM_TALENT} /> is active - Missed{' '}
                  {this.missingSiphonStorm} times
                </li>
              )}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.ARCANE_SURGE_TALENT}>
          <>
            {formatPercentage(this.cooldownUtilization, 0)}% <small> Cooldown utilization</small>
            {this.badArcaneSurges() > 0 && (
              <>
                <br />
                {this.badArcaneSurges()} <small>Bad Cooldown Uses</small>
              </>
            )}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneSurgePreReqs;
