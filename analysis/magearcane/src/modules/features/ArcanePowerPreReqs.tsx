import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
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
import {
  AP_MANA_THRESHOLD_PERCENT,
  ARCANE_CHARGE_MAX_STACKS,
  ARCANE_HARMONY_MAX_STACKS,
} from '@wowanalyzer/mage';

const debug = false;

class ArcanePowerPreReqs extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
  };
  protected eventHistory!: EventHistory;
  protected abilityTracker!: AbilityTracker;
  protected arcaneChargeTracker!: ArcaneChargeTracker;

  hasOverpowered: boolean;
  hasArcaneHarmony: boolean;

  lowArcaneCharges = 0;
  lowMana = 0;
  missingTouchOfTheMagi = 0;
  lowArcaneHarmonyStacks = 0;
  badCooldownUses = 0;
  failedChecks = 0;

  constructor(options: Options) {
    super(options);
    this.hasOverpowered = this.selectedCombatant.hasTalent(SPELLS.OVERPOWERED_TALENT.id);
    this.hasArcaneHarmony = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.ARCANE_HARMONY.bonusID,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_POWER),
      this.onArcanePower,
    );
  }

  onArcanePower(event: CastEvent) {
    const manaResource: any =
      event.classResources &&
      event.classResources.find((classResource) => classResource.type === RESOURCE_TYPES.MANA.id);
    const currentManaPercent = manaResource.amount / manaResource.max;
    const touchOfTheMagiCast = this.eventHistory.last(
      1,
      1000,
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TOUCH_OF_THE_MAGI),
    );
    const arcaneHarmonyBuff = this.selectedCombatant.getBuff(SPELLS.ARCANE_HARMONY_BUFF.id);
    let badCooldownUse = false;

    //Checks if the player was capped on Arcane Charges
    if (this.arcaneChargeTracker.charges < ARCANE_CHARGE_MAX_STACKS) {
      debug && this.log('Arcane Power Cast with Low Charges');
      badCooldownUse = true;
      this.failedChecks += 1;
      this.lowArcaneCharges += 1;
    }

    //Checks if the player was too low on mana
    if (!this.hasOverpowered && currentManaPercent < AP_MANA_THRESHOLD_PERCENT) {
      debug && this.log('Arcane power Cast with Low Mana');
      badCooldownUse = true;
      this.failedChecks += 1;
      this.lowMana += 1;
    }

    //Checks if Touch of the Magi was cast immediately before Arcane Power
    if (touchOfTheMagiCast.length === 0) {
      debug && this.log('Arcane Power cast without Touch of the Magi');
      badCooldownUse = true;
      this.failedChecks += 1;
      this.missingTouchOfTheMagi += 1;
    }

    //Checks if the player has 18 stacks of Arcane Harmony (If using the Arcane Harmony Legendary)
    if (
      this.hasArcaneHarmony &&
      (!arcaneHarmonyBuff || arcaneHarmonyBuff.stacks < ARCANE_HARMONY_MAX_STACKS)
    ) {
      debug && this.log('Arcane Power cast without 18 stacks of Arcane Harmony');
      badCooldownUse = true;
      this.failedChecks += 1;
      this.lowArcaneHarmonyStacks += 1;
    }

    //If any of the above checks were failed, mark the AP Cast as a bad cast
    if (badCooldownUse === true) {
      this.badCooldownUses += 1;
    }
  }

  get totalAPCasts() {
    return this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts || 0;
  }

  get cooldownUtilization() {
    return 1 - this.badCooldownUses / this.totalAPCasts;
  }

  get arcanePowerCooldownThresholds() {
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

  suggestions(when: When) {
    when(this.arcanePowerCooldownThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={SPELLS.ARCANE_POWER.id} /> without proper setup{' '}
          {this.badCooldownUses} times. Arcane Power has a short duration so you should get the most
          out of it by meeting all requirements before casting it.
          <ul>
            <li>
              You have {ARCANE_CHARGE_MAX_STACKS} <SpellLink id={SPELLS.ARCANE_CHARGE.id} /> - You
              failed this {this.lowArcaneCharges} times.
            </li>
            <li>
              <>
                You cast <SpellLink id={SPELLS.TOUCH_OF_THE_MAGI.id} />
                <TooltipElement content="Arcane Power should be cast right on the end of the Rune of Power cast. There should not be any casts or any delay in between Rune of Power and Arcane Power to ensure that Rune of Power is up for the entire duration of Arcane Power.">
                  immediately
                </TooltipElement>
                before Arcane Power - You failed this {this.missingTouchOfTheMagi} times.
              </>
            </li>
            {!this.hasOverpowered ? (
              <li>
                You have more than {formatPercentage(AP_MANA_THRESHOLD_PERCENT)} mana - You failed
                this {this.lowMana} times.
              </li>
            ) : (
              ''
            )}
            {this.hasArcaneHarmony ? (
              <li>
                You have {ARCANE_HARMONY_MAX_STACKS} stacks of{' '}
                <SpellLink id={SPELLS.ARCANE_HARMONY_BUFF.id} /> - You failed this{' '}
                {this.lowArcaneHarmonyStacks} times.
              </li>
            ) : (
              ''
            )}
          </ul>
        </>,
      )
        .icon(SPELLS.ARCANE_POWER.icon)
        .actual(
          <Trans id="mage.arcane.suggestions.arcanePower.badCasts">
            {this.badCooldownUses} Bad Cooldown Uses
          </Trans>,
        )
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
            Before casting Arcane Power, you should ensure that you meet all of the following
            requirements. If Arcane Power frequently comes off cooldown and these requirements are
            not already met, then consider modifying your rotation to ensure that they are met
            before Arcane Power comes off cooldown
            <ul>
              <li>
                You have {ARCANE_CHARGE_MAX_STACKS} Arcane Charges - Missed {this.lowArcaneCharges}{' '}
                times
              </li>
              <li>
                You cast Touch of the Magi immediately before AP - Missed{' '}
                {this.missingTouchOfTheMagi} times
              </li>
              {!this.hasOverpowered && (
                <li>
                  You have more than {formatPercentage(AP_MANA_THRESHOLD_PERCENT)} mana - Missed{' '}
                  {this.lowMana} times
                </li>
              )}
              {this.hasArcaneHarmony && (
                <li>
                  You have {ARCANE_HARMONY_MAX_STACKS} stacks of Arcane Harmony - Missed{' '}
                  {this.lowArcaneHarmonyStacks} times
                </li>
              )}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.ARCANE_POWER.id}>
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

export default ArcanePowerPreReqs;
