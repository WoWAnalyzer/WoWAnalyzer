import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { TooltipElement } from 'common/Tooltip';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import DeathTracker from 'parser/shared/modules/DeathTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import Enemies from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { Trans } from '@lingui/macro';

import Spell from 'common/SPELLS/Spell';

import ArcaneChargeTracker from './ArcaneChargeTracker';

const MANA_THRESHOLD = 0.40;
const ARCANE_POWER_SPELL_BLACKLIST: Spell[] = [
  SPELLS.ARCANE_BARRAGE,
  SPELLS.ARCANE_FAMILIAR_TALENT,
  SPELLS.ARCANE_INTELLECT,
  SPELLS.EVOCATION,
  SPELLS.SUPERNOVA_TALENT,
  SPELLS.NETHER_TEMPEST_TALENT,
  SPELLS.ARCANE_ORB_TALENT,
  SPELLS.RUNE_OF_POWER_TALENT,
];
const ARCANE_EXPLOSION_COST = 5000;
const ARCANE_BLAST_BASE_COST = 1375;
const OVERPOWERED_COST_REDUCTION = 0.5;

const debug = false;

class ArcanePower extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
    spellUsable: SpellUsable,
    deathTracker: DeathTracker,
    // Needed for the `resourceCost` prop of events
    spellManaCost: SpellManaCost,
    enemies: Enemies,
    eventHistory: EventHistory,
  };
  protected abilityTracker!: AbilityTracker;
  protected arcaneChargeTracker!: ArcaneChargeTracker;
  protected spellUsable!: SpellUsable;
  protected deathTracker!: DeathTracker;
  protected spellManaCost!: SpellManaCost;
  protected enemies!: Enemies;
  protected eventHistory!: EventHistory;

  protected hasOverpowered: boolean;

  badUses = 0;
  totalCastsDuringAP = 0;
  badCastsDuringAP = 0;
  outOfMana = 0;
  buffEndTimestamp = 0;
  arcanePowerCasted = false;
  lowManaCast = 0;
  lowChargesCast = 0;
  missingTouchOfTheMagi = 0;

  constructor(options: Options) {
    super(options);
    this.hasOverpowered = this.selectedCombatant.hasTalent(SPELLS.OVERPOWERED_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_POWER), this.onArcanePowerCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.ARCANE_POWER), this.onApplyBuff);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.ARCANE_POWER), this.onRemoveBuff);
  }

  onArcanePowerCast(event: CastEvent) {
    const manaResource: any = event.classResources && event.classResources.find(classResource => classResource.type === RESOURCE_TYPES.MANA.id);
    const currentManaPercent = manaResource.amount / manaResource.max;
    const touchOfTheMagiCast = this.eventHistory.last(1, 1000, Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TOUCH_OF_THE_MAGI));
    this.arcanePowerCasted = true;

    if (this.arcaneChargeTracker.charges < 4 || (!this.hasOverpowered && currentManaPercent < MANA_THRESHOLD) || touchOfTheMagiCast.length === 0) {
      this.badUses += 1;
    }

    if (this.arcaneChargeTracker.charges < 4) {
      debug && this.log('Arcane Power Cast with Low Charges');
      this.lowChargesCast += 1;
    }

    if (!this.hasOverpowered && currentManaPercent < MANA_THRESHOLD) {
      debug && this.log('Arcane Power Cast with low mana');
      this.lowManaCast += 1;
    }

    if (touchOfTheMagiCast.length === 0) {
      debug && this.log('Arcane Power cast without Touch of the Magi');
      this.missingTouchOfTheMagi += 1;
    }
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.ARCANE_POWER.id)) {
      return;
    }

    // Any spell except arcane power or rune of power that was cast during Arcane Power
    this.totalCastsDuringAP += 1;
    if (ARCANE_POWER_SPELL_BLACKLIST.some(spell => spell.id === event.ability.guid)) {
      debug && this.log('Cast ' + event.ability.name + ' during Arcane Power');
      this.badCastsDuringAP += 1;
    } else if (spellId === SPELLS.ARCANE_BLAST.id || spellId === SPELLS.ARCANE_EXPLOSION.id) {
      event.classResources && event.classResources.forEach(resource => {
        if (resource.type !== RESOURCE_TYPES.MANA.id) {
          return;
        }
        const currentMana = resource.amount;
        const manaCost: any = event.resourceCost && (event.resourceCost[RESOURCE_TYPES.MANA.id] + (event.resourceCost[RESOURCE_TYPES.MANA.id] * this.arcaneChargeTracker.charges));
        const manaRemaining = currentMana - manaCost;
        const buffTimeRemaining = this.buffEndTimestamp - event.timestamp;
        if (manaRemaining < this.estimatedManaCost(spellId) && buffTimeRemaining > 1000) {
          debug && this.log('Ran Out of Mana during Arcane Power');
          this.outOfMana += 1;
        }
      });
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (this.arcanePowerCasted) {
      this.buffEndTimestamp = event.timestamp + 10000;
    } else {
      this.buffEndTimestamp = event.timestamp + 8000;
    }
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.arcanePowerCasted = false;
  }

  estimatedManaCost(spellId: number) {
    if (spellId === SPELLS.ARCANE_EXPLOSION.id) {
      if (this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE.id)) {
        return 0;
      } else {
        return this.hasOverpowered ? ARCANE_EXPLOSION_COST * OVERPOWERED_COST_REDUCTION : ARCANE_EXPLOSION_COST;
      }
    }

    const arcaneCharges = this.arcaneChargeTracker.charges < 4 ? this.arcaneChargeTracker.charges + 1 : 4;
    if (spellId === SPELLS.ARCANE_BLAST.id) {
      if (this.selectedCombatant.hasBuff(SPELLS.RULE_OF_THREES_BUFF.id)) {
        return 0
      } else {
        return this.hasOverpowered ? (ARCANE_BLAST_BASE_COST * arcaneCharges ) * OVERPOWERED_COST_REDUCTION : ARCANE_BLAST_BASE_COST * arcaneCharges;
      }
    }
    return 0;
  }

  get requiredChecks() {
    return this.hasOverpowered ? 2 : 3;
  }

  get failedChecks() {
    return this.lowChargesCast + this.lowManaCast;
  }

  get cooldownUtilization() {
    return 1 - (this.failedChecks / (this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts * this.requiredChecks));
  }

  get castUtilization() {
    return 1 - (this.badCastsDuringAP / this.totalCastsDuringAP);
  }
  
  get totalArcanePowerCasts() {
    return this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts;
  }

  get arcanePowerCooldownThresholds() {
    return {
      actual: this.cooldownUtilization,
      isLessThan: {
        minor: 1,
        average: 0.80,
        major: 0.60,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get arcanePowerCastThresholds() {
    return {
      actual: this.castUtilization,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.90,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get arcanePowerManaUtilization() {
    return {
      actual: 1 - (this.outOfMana / this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts),
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.90,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.arcanePowerCooldownThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You cast <SpellLink id={SPELLS.ARCANE_POWER.id} /> without proper setup {this.badUses} times. Arcane Power has a short duration so you should get the most out of it by meeting all requirements before casting it.
        <ul>
          <li>You have 4 <SpellLink id={SPELLS.ARCANE_CHARGE.id} /> - You failed this {this.lowChargesCast} times out of {this.totalArcanePowerCasts} casts.</li>
          <li><>You cast <SpellLink id={SPELLS.TOUCH_OF_THE_MAGI.id} /> <TooltipElement content="Arcane Power should be cast right on the end of the Rune of Power cast. There should not be any casts or any delay in between Rune of Power and Arcane Power to ensure that Rune of Power is up for the entire duration of Arcane Power.">immediately</TooltipElement> before Arcane Power - You failed this {this.missingTouchOfTheMagi} times out of {this.totalArcanePowerCasts} casts</> </li>
          {!this.hasOverpowered ? <li>You have more than 40% mana - You failed this {this.lowManaCast} times out of {this.totalArcanePowerCasts} casts.</li> : ''}
        </ul>
      </>)
        .icon(SPELLS.ARCANE_POWER.icon)
        .actual(<Trans id="mage.arcane.suggestions.arcanePower.badCasts">{this.badUses} Bad Casts</Trans>)
        .recommended(`0 is recommended`));
    when(this.arcanePowerCastThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You cast spells other than <SpellLink id={SPELLS.ARCANE_BLAST.id} />,<SpellLink id={SPELLS.ARCANE_MISSILES.id} />, <SpellLink id={SPELLS.ARCANE_EXPLOSION.id} />, and <SpellLink id={SPELLS.PRESENCE_OF_MIND.id} /> during <SpellLink id={SPELLS.ARCANE_POWER.id} />. Arcane Power is a short duration, so you should ensure that you are getting the most use out of it. Buff spells like Rune of Power should be cast immediately before casting Arcane Power. Other spells such as Charged Up, Blink/Shimmer, etc are acceptable during Arcane Power, but should be avoided if possible.</>)
        .icon(SPELLS.ARCANE_POWER.icon)
        .actual(<Trans id="mage.arcane.suggestions.arcanePower.utilization">{formatPercentage(actual)}% Utilization</Trans>)
        .recommended(`${formatPercentage(recommended)}% is recommended`));
    when(this.arcanePowerManaUtilization)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You ran dangerously low or ran out of mana during <SpellLink id={SPELLS.ARCANE_POWER.id} /> {this.outOfMana} times. Running out of mana during Arcane Power is a massive DPS loss and should be avoided at all costs. {!this.hasOverpowered ? 'To avoid this, ensure you have at least 40% mana before casting Arcane Power to ensure you have enough mana to finish Arcane Power.' : ''}</>)
        .icon(SPELLS.ARCANE_POWER.icon)
        .actual(<Trans id="mage.arcane.suggestions.arcanePower.lowMana">{formatPercentage(actual)}% Utilization</Trans>)
        .recommended(`${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            Before casting Arcane Power, you should ensure that you meet all of the following requirements. If Arcane Power frequently comes off cooldown and these requirements are not already met, then consider modifying your rotation to ensure that they are met before Arcane Power comes off cooldown
            <ul>
              <li>You have 4 Arcane Charges - Missed {this.lowChargesCast} times</li>
              <li>You cast Touch of the Magi immediately before AP - Missed {this.missingTouchOfTheMagi} times</li>
              {!this.hasOverpowered && <li>You have more than 40% mana - Missed {this.lowManaCast} times</li>}
            </ul>
            Additionally, you should only be casting Arcane Blast (Single Target), Arcane Explosion (AOE), and Arcane Missiles (If you have a Clearcasting Proc) during Arcane Power to maximize the short cooldown duration.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.ARCANE_FAMILIAR_TALENT}>
          <>
            <SpellIcon
              id={SPELLS.ARCANE_POWER.id}
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />
            {' '}{formatPercentage(this.cooldownUtilization, 0)}% <small> Cooldown utilization</small><br />
            <SpellIcon
              id={SPELLS.ARCANE_BLAST.id}
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />
            {' '}{formatPercentage(this.castUtilization, 0)}% <small>Cast utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcanePower;
