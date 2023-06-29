import { ARCANE_CHARGE_MAX_STACKS, ARCANE_HARMONY_MAX_STACKS } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import ArcaneChargeTracker from './ArcaneChargeTracker';

const debug = false;

class ArcaneSurgePreReqs extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
  };
  protected eventHistory!: EventHistory;
  protected abilityTracker!: AbilityTracker;
  protected arcaneChargeTracker!: ArcaneChargeTracker;

  hasArcaneHarmony: boolean;
  isKyrian: boolean;

  lowArcaneCharges = 0;
  lowMana = 0;
  missingTouchOfTheMagi = 0;
  lowArcaneHarmonyStacks = 0;
  noRadiantSpark = 0;
  badCooldownUses = 0;
  failedChecks = 0;

  constructor(options: Options) {
    super(options);
    this.hasArcaneHarmony = false;
    this.isKyrian = false;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_SURGE_TALENT),
      this.onArcaneSurge,
    );
  }

  onArcaneSurge(event: CastEvent) {
    const touchOfTheMagiCast = this.eventHistory.last(
      1,
      1000,
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.TOUCH_OF_THE_MAGI_TALENT),
    );
    const arcaneHarmonyBuff = this.selectedCombatant.getBuff(SPELLS.ARCANE_HARMONY_BUFF.id);
    let badCooldownUse = false;

    //Checks if the player was capped on Arcane Charges
    if (this.arcaneChargeTracker.charges < ARCANE_CHARGE_MAX_STACKS) {
      debug && this.log('Arcane Surge Cast with Low Charges');
      badCooldownUse = true;
      this.failedChecks += 1;
      this.lowArcaneCharges += 1;
    }

    //Checks if Touch of the Magi was cast immediately before Arcane Surge
    if (touchOfTheMagiCast.length === 0) {
      debug && this.log('Arcane Surge cast without Touch of the Magi');
      badCooldownUse = true;
      this.failedChecks += 1;
      this.missingTouchOfTheMagi += 1;
    }

    //Checks if the player has 20 stacks of Arcane Harmony (If using the Arcane Harmony Legendary)
    if (
      this.hasArcaneHarmony &&
      (!arcaneHarmonyBuff || arcaneHarmonyBuff.stacks < ARCANE_HARMONY_MAX_STACKS)
    ) {
      debug && this.log('Arcane Surge cast without 20 stacks of Arcane Harmony');
      badCooldownUse = true;
      this.failedChecks += 1;
      this.lowArcaneHarmonyStacks += 1;
    }

    //Checks if Radiant Spark is active (if the player is Kyrian)
    if (this.isKyrian && !this.selectedCombatant.hasBuff(TALENTS.RADIANT_SPARK_TALENT.id)) {
      debug && this.log('Radiant Spark is not active');
      badCooldownUse = true;
      this.failedChecks += 1;
      this.noRadiantSpark += 1;
    }

    //If any of the above checks were failed, mark the AP Cast as a bad cast
    if (badCooldownUse === true) {
      this.badCooldownUses += 1;
    }
  }

  get totalASCasts() {
    return this.abilityTracker.getAbility(TALENTS.ARCANE_SURGE_TALENT.id).casts || 0;
  }

  get cooldownUtilization() {
    return 1 - this.badCooldownUses / this.totalASCasts;
  }

  get arcaneSurgePreReqThresholds() {
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

  get arcaneHarmonyPreReqThresholds() {
    return {
      actual: this.lowArcaneHarmonyStacks,
      isGreaterThan: {
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get radiantSparkPreReqThresholds() {
    return {
      actual: this.noRadiantSpark,
      isGreaterThan: {
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.arcaneSurgePreReqThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={TALENTS.ARCANE_SURGE_TALENT.id} /> without proper setup{' '}
          {this.badCooldownUses} times. Arcane Surge has a short duration so you should get the most
          out of it by meeting all requirements before casting it.
          <ul>
            <li>
              You have {ARCANE_CHARGE_MAX_STACKS} <SpellLink id={SPELLS.ARCANE_CHARGE.id} /> - You
              failed this {this.lowArcaneCharges} times.
            </li>
            <li>
              <>
                You cast <SpellLink id={TALENTS.TOUCH_OF_THE_MAGI_TALENT.id} />
                <TooltipElement content="Arcane Surge should be cast right on the end of the Rune of Power cast. There should not be any casts or any delay in between Rune of Power and Arcane Surge to ensure that Rune of Power is up for the entire duration of Arcane Surge.">
                  immediately
                </TooltipElement>
                before Arcane Surge - You failed this {this.missingTouchOfTheMagi} times.
              </>
            </li>
            {this.hasArcaneHarmony && (
              <li>
                You have {ARCANE_HARMONY_MAX_STACKS} stacks of{' '}
                <SpellLink id={SPELLS.ARCANE_HARMONY_BUFF.id} /> - You failed this{' '}
                {this.lowArcaneHarmonyStacks} times.
              </li>
            )}
            {this.isKyrian && (
              <li>
                <SpellLink id={TALENTS.RADIANT_SPARK_TALENT.id} /> is active. - You failed this{' '}
                {this.noRadiantSpark} times.
              </li>
            )}
          </ul>
        </>,
      )
        .icon(TALENTS.ARCANE_SURGE_TALENT.icon)
        .actual(<>{this.badCooldownUses} Bad Cooldown Uses</>)
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
                You have {ARCANE_CHARGE_MAX_STACKS} Arcane Charges - Missed {this.lowArcaneCharges}{' '}
                times
              </li>
              <li>
                You cast Touch of the Magi immediately before AP - Missed{' '}
                {this.missingTouchOfTheMagi} times
              </li>
              {this.hasArcaneHarmony && (
                <li>
                  You have {ARCANE_HARMONY_MAX_STACKS} stacks of Arcane Harmony - Missed{' '}
                  {this.lowArcaneHarmonyStacks} times
                </li>
              )}
              {this.hasArcaneHarmony && (
                <li>
                  <SpellLink id={TALENTS.RADIANT_SPARK_TALENT.id} /> is active - Missed{' '}
                  {this.noRadiantSpark} times
                </li>
              )}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.ARCANE_SURGE_TALENT.id}>
          <>
            {formatPercentage(this.cooldownUtilization, 0)}% <small> Cooldown utilization</small>
            {this.badCooldownUses > 0 && (
              <>
                <br />
                {this.badCooldownUses} <small>Bad Cooldown Uses</small>
              </>
            )}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneSurgePreReqs;
