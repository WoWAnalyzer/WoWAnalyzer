import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import DistanceMoved from 'parser/shared/modules/others/DistanceMoved';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SpellLink from 'common/SpellLink';
import Events, { ApplyBuffEvent, CastEvent, GlobalCooldownEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';

const MS_BUFFER = 100;

class Renew extends Analyzer {
  static dependencies = {
    distanceMoved: DistanceMoved,
    spellUsable: SpellUsable,
  };
  protected distanceMoved!: DistanceMoved;
  protected spellUsable!: SpellUsable;

  totalRenewHealing = 0;
  totalRenewOverhealing = 0;
  totalRenewAbsorbs = 0;
  totalRenewTicks = 0;

  lastRenewCast: number = 0;
  renewsCast = 0;
  goodRenews = 0;
  // A list of the reasons that a renew is listed as "bad". I may expand upon this later in a card.
  badRenewReason = {
    betterspell: 0,
    stationary: 0,
  };
  totalRenewApplications = 0;

  salvationActive = false;
  lastSalvationCast = 0;
  renewsFromSalvation = 0;

  benedictionActive = false;
  renewsFromBenedictionAndRenew = 0;

  lastGCD: GlobalCooldownEvent | null = null;
  lastCast: CastEvent | null = null;

  constructor(options: Options) {
    super(options);

    if (this.selectedCombatant.hasTalent(SPELLS.HOLY_WORD_SALVATION_TALENT.id)) {
      this.salvationActive = true;
    }
    if (this.selectedCombatant.hasTalent(SPELLS.BENEDICTION_TALENT.id)) {
      this.benedictionActive = true;
    }
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEW), this.onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEW), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.RENEW), this.onRefreshBuff);
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.onGCD);
  }

  get renewsFromBenediction() {
    return this.renewsFromBenedictionAndRenew - this.renewsCast;
  }

  get badRenews() {
    return this.renewsCast - this.goodRenews;
  }

  get badRenewThreshold() {
    return {
      actual: this.badRenews,
      isGreaterThan: {
        minor: 2 * this.owner.fightDuration / 1000 / 60,
        average: 3 * this.owner.fightDuration / 1000 / 60,
        major: 4 * this.owner.fightDuration / 1000 / 60,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  healingFromRenew(applicationCount: number) {
    const averageHealingPerRenewApplication = this.totalRenewHealing / this.totalRenewApplications;
    return averageHealingPerRenewApplication * applicationCount;
  }

  overhealingFromRenew(applicationCount: number) {
    const averageOverHealingPerRenewApplication = this.totalRenewOverhealing / this.totalRenewApplications;
    return averageOverHealingPerRenewApplication * applicationCount;
  }

  absorptionFromRenew(applicationCount: number) {
    const averageAbsorptionPerRenewApplication = this.totalRenewOverhealing / this.totalRenewApplications;
    return averageAbsorptionPerRenewApplication * applicationCount;
  }

  onHeal(event: HealEvent) {
    this.totalRenewHealing += event.amount || 0;
    this.totalRenewOverhealing += event.overheal || 0;
    this.totalRenewAbsorbs += event.absorbed || 0;
    this.totalRenewTicks += 1;
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (this.lastCast) {
      // If our last cast was a renew cast, validate that it was used well.
      this.validateRenew(event);
    }
    if (spellId === SPELLS.RENEW.id) {
      this.renewsCast += 1;
      this.lastCast = event;
    } else if (spellId === SPELLS.HOLY_WORD_SALVATION_TALENT.id) {
      this.lastSalvationCast = event.timestamp;
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.handleRenewApplication(event);
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    this.handleRenewApplication(event);
  }

  handleRenewApplication(event: ApplyBuffEvent | RefreshBuffEvent) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.RENEW.id) {
      return;
    }

    this.totalRenewApplications += 1;

    if (this.salvationActive && event.timestamp - this.lastSalvationCast < MS_BUFFER) {
      this.renewsFromSalvation += 1;
    } else {
      this.renewsFromBenedictionAndRenew += 1;
    }
  }

  onGCD(event: GlobalCooldownEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RENEW.id) {
      return;
    }
    this.lastGCD = event;
  }

  // This function validates if a renew should have been cast at all.
  validateRenew(event: CastEvent) {
    this.lastRenewCast = event.timestamp;
    if (this.lastGCD && this.movedSinceCast(event)) {
      // We are moving, but do we have any other instant cast spells?
      const sanctifyOnCooldown = this.spellUsable.isOnCooldown(SPELLS.HOLY_WORD_SANCTIFY.id);
      const serenityOnCooldown = this.spellUsable.isOnCooldown(SPELLS.HOLY_WORD_SERENITY.id);
      let cohOnCooldown = true;
      if (this.selectedCombatant.hasTalent(SPELLS.CIRCLE_OF_HEALING_TALENT.id)) {
        cohOnCooldown = this.spellUsable.isOnCooldown(SPELLS.CIRCLE_OF_HEALING_TALENT.id);
      }
      if (sanctifyOnCooldown && serenityOnCooldown && cohOnCooldown) {
        this.goodRenews += 1;
      } else {
        this.badRenewReason.betterspell = (this.badRenewReason.betterspell || 0) + 1;
      }
    }
    this.badRenewReason.stationary = (this.badRenewReason.stationary || 0) + 1;

    // Reset the cast history
    this.lastGCD = null;
    this.lastCast = null;
  }

  movedSinceCast(event: CastEvent) {
    if (this.lastGCD == null) {
      return false;
    }
    const timeSinceCast = event.timestamp - this.lastGCD.timestamp;
    const timeSinceLastMovement = this.distanceMoved.timeSinceLastMovement();

    if (timeSinceLastMovement !== null && timeSinceLastMovement < timeSinceCast) {
      return true;
    }
    return false;
  }

  suggestions(when: When) {
    when(this.badRenewThreshold)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You should cast <SpellLink id={SPELLS.RENEW.id} /> less.</>)
            .icon(SPELLS.RENEW.icon)
            .actual(<>
              You used Renew {this.badRenews} times when another spell would have been more productive.
              Renew is one of the least efficient spells Holy Priests have, and should only be cast when moving with no other instants available.</>)
            .recommended(`Two or less per minute is recommended, except for movement heavy fights.`),
      );
  }
}

export default Renew;
