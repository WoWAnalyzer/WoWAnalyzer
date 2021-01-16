import React from 'react';
import { Trans } from '@lingui/macro';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Panel from 'interface/statistics/Panel';
import CastEfficiencyComponent from 'interface/CastEfficiency';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellHistory from 'parser/shared/modules/SpellHistory';
import Abilities from 'parser/core/modules/Abilities';

import Haste from 'parser/shared/modules/Haste';

import AbilityTracker from './AbilityTracker';

import { EventType, UpdateSpellUsableEvent } from '../../core/Events';
import Combatant from '../../core/Combatant';
import Ability, { SpellbookAbility } from '../../core/modules/Ability';

const DEFAULT_RECOMMENDED = 0.8;
const DEFAULT_AVERAGE_DOWNSTEP = 0.05;
const DEFAULT_MAJOR_DOWNSTEP = 0.15;
const seconds = (ms: number) => ms / 1000;
const minutes = (ms: number) => seconds(ms) / 60;

export interface AbilityCastEfficiency {
  ability: Ability;
  cpm: number;
  casts: number;
  maxCasts: number;
  efficiency: number | null;
  recommendedEfficiency: number;
  averageIssueEfficiency: number;
  majorIssueEfficiency: number;
  gotMaxCasts: boolean;
  canBeImproved?: boolean;
}

class CastEfficiency extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    haste: Haste,
    spellHistory: SpellHistory,
    abilities: Abilities,
  };
  protected abilityTracker!: AbilityTracker;
  protected haste!: Haste;
  protected spellHistory!: SpellHistory;
  protected abilities!: Abilities;

  /**
   * Gets info about spell's cooldown behavior. All values are as of the current timestamp.
   * completedRechargeTime is the total ms of completed cooldowns
   * endingRechargeTime is the total ms into current cooldown
   * recharges is the total number of times the spell has recharged (either come off cooldown or gained a charge)
   * Only works on spells entered into CastEfficiency list.
   */
  private getCooldownInfo(ability: any) {
    const mainSpellId = ability.primarySpell.id;
    const history = this.spellHistory.historyBySpellId[mainSpellId];
    if (!history) {
      // spell either never been cast, or not in abilities list
      return {
        completedRechargeTime: 0,
        endingRechargeTime: 0,
        recharges: 0,
        casts: 0,
        castTimestamps: [],
      };
    }

    let lastRechargeTimestamp: number | undefined = undefined;
    let recharges = 0;
    const completedRechargeTime = history.filter(
      (event): event is UpdateSpellUsableEvent =>
        event.type === EventType.UpdateSpellUsable,
    ).reduce((acc, event) => {
      if (event.trigger === EventType.BeginCooldown) {
        lastRechargeTimestamp = event.timestamp;
        return acc;
      } else if (event.trigger === EventType.EndCooldown) {
        //limit by start time in case of pre phase events
        recharges += 1;
        lastRechargeTimestamp = undefined;
        // this is just event.timePassed except `endcooldown` events
        // don't have `timePassed` filled in.
        return acc + event.timestamp - event.start;
        // This might cause oddness if we add anything that externally refreshes charges, but so far nothing does
      } else if (event.trigger === EventType.RestoreCharge) {
        //limit by start time in case of pre phase events
        recharges += 1;
        let timePassed = event.timePassed;
        if (timePassed === undefined) {
          // This should never happen...
          if (process.env.NODE_ENV === 'development') {
            throw new Error('timePassed not set on restorecharge updatespellusable event');
          }
          timePassed = 0;
        }
        lastRechargeTimestamp = event.timestamp;
        return acc + timePassed;
      } else {
        return acc;
      }
    }, 0);
    //limit by start time in case of pre phase events
    const endingRechargeTime = !lastRechargeTimestamp
      ? 0
      : this.owner.currentTimestamp -
      Math.max(lastRechargeTimestamp, this.owner.fight.start_time);

    const casts = history.filter(event => event.type === EventType.Cast).length;

    const castEvents = history.filter(event => event.type === EventType.Cast);
    const castTimestamps = castEvents.map(
      event => event.timestamp - this.owner.fight.start_time,
    );

    return {
      completedRechargeTime,
      endingRechargeTime,
      recharges,
      casts,
      castTimestamps,
    };
  }

  private _getTimeSpentCasting(spellId: number) {
    const history = this.spellHistory.historyBySpellId[spellId];
    if (!history) {
      // spell either never been cast, or not in abilities list
      return 0;
    }

    let beginCastTimestamp: number | undefined;
    const timeSpentCasting = history.reduce((acc, event) => {
      if (event.type === EventType.BeginCast) {
        beginCastTimestamp = event.timestamp;
        return acc;
      } else if (event.type === EventType.Cast) {
        //limit by start time in case of pre phase events
        const castTime = beginCastTimestamp
          ? event.timestamp -
          Math.max(beginCastTimestamp, this.owner.fight.start_time)
          : 0;
        beginCastTimestamp = undefined;
        return acc + castTime;
      } else {
        return acc;
      }
    }, 0);

    return timeSpentCasting;
  }

  private getGcd(gcd: SpellbookAbility['gcd']) {
    const getGcdValue = (value: ((combatant: Combatant) => number) | number) =>
      typeof value === 'function' ? value(this.owner.selectedCombatant) : value;

    if (typeof gcd === 'function') {
      return gcd(this.owner.selectedCombatant);
    } else if (gcd && gcd.static) {
      return getGcdValue(gcd.static);
    } else if (gcd && gcd.base) {
      const base = getGcdValue(gcd.base);
      const minimum = gcd.minimum ? getGcdValue(gcd.minimum) : base / 2;
      const gcdReduction = base * this.haste.current;
      const gcdActual = Math.max(minimum, base - gcdReduction);

      return gcdActual;
    }
    return undefined;
  }

  private getTimeSpentOnGcd(spellId: number) {
    const ability = this.abilities.getAbility(spellId);

    if (ability && ability.gcd) {
      const cdInfo = this.getCooldownInfo(ability);

      let casts;
      if (ability.castEfficiency.casts) {
        casts = ability.castEfficiency.casts(
          this.abilityTracker.getAbility(spellId),
          this.owner,
        );
      } else {
        casts = cdInfo.casts;
      }

      const averagetimeSpentOnAbility =
        this._getTimeSpentCasting(ability.primarySpell.id) / casts;
      // If the abilities GCD is longer than the time spent casting, use the GCD
      const gcd = this.getGcd(ability.gcd);
      if (gcd && gcd > averagetimeSpentOnAbility) {
        return gcd * casts;
      }
    }
    return 0;
  }

  getTimeSpentCasting(abilityId: number) {
    const timeSpentCasting = this._getTimeSpentCasting(abilityId);
    const gcdSpent = this.getTimeSpentOnGcd(abilityId);

    return {
      timeSpentCasting,
      gcdSpent,
    };
  }

  /**
   * Time spent waiting for a GCD that reset the cooldown of the spell to finish
   */
  private _getTimeWaitingOnGCD(spellId: number) {
    const history = this.spellHistory.historyBySpellId[spellId];
    if (!history) {
      // spell either never been cast, or not in abilities list
      return 0;
    }

    const timeWaitingOnGCD = history.reduce((acc, event) => {
      if (event.type === EventType.UpdateSpellUsable && event.timeWaitingOnGCD) {
        return acc + event.timeWaitingOnGCD;
      } else {
        return acc;
      }
    }, 0);

    return timeWaitingOnGCD;
  }

  /**
   * Packs cast efficiency results for use by suggestions / tab
   */
  getCastEfficiency() {
    return this.abilities.activeAbilities
      .map(ability => this.getCastEfficiencyForAbility(ability))
      .filter(item => item !== null) as AbilityCastEfficiency[]; // getCastEfficiencyForAbility can return null, remove those from the result
  }

  getCastEfficiencyForSpellId(
    spellId: number,
    includeNoCooldownEfficiency = false,
  ) {
    const ability = this.abilities.getAbility(spellId);
    return ability
      ? this.getCastEfficiencyForAbility(ability, includeNoCooldownEfficiency)
      : null;
  }

  getCastEfficiencyForAbility(
    ability: Ability,
    includeNoCooldownEfficiency = false,
  ): AbilityCastEfficiency | null {
    const spellId = ability.primarySpell.id;
    const availableFightDuration = this.owner.fightDuration;

    const cooldown = ability.cooldown;
    const cooldownMs = !cooldown ? null : cooldown * 1000;
    const cdInfo = this.getCooldownInfo(ability);
    const timeSpentCasting =
      cooldown && ability.charges < 2
        ? this._getTimeSpentCasting(ability.primarySpell.id)
        : 0;
    const timeWaitingOnGCD =
      cooldown && ability.charges < 2 && ability.gcd
        ? this._getTimeWaitingOnGCD(ability.primarySpell.id)
        : 0;

    // ability.casts is used for special cases that show the wrong number of cast events, like Penance
    // and also for splitting up differently buffed versions of the same spell
    let casts;
    if (ability.castEfficiency.casts) {
      casts = ability.castEfficiency.casts(
        this.abilityTracker.getAbility(spellId),
        this.owner,
      );
    } else {
      casts = cdInfo.casts;
    }
    const cpm = casts / minutes(availableFightDuration);
    const averageTimeSpentCasting = timeSpentCasting / casts;
    const averageTimeWaitingOnGCD = timeWaitingOnGCD / casts;

    if (ability.isUndetectable && casts === 0) {
      // Some spells (most notably Racials) can not be detected if a player has them. This hides those spells if they have 0 casts.
      return null;
    }

    // ability.maxCasts is used for special cases for spells that have a variable availability or CD based on state, like Void Bolt.
    // This same behavior should be managable using SpellUsable's interface, so maxCasts is deprecated.
    // Legacy support: if maxCasts is defined, cast efficiency will be calculated using casts/rawMaxCasts
    let rawMaxCasts: number | undefined;
    const averageCooldown = cdInfo.recharges === 0 ? null : cdInfo.completedRechargeTime / cdInfo.recharges;
    if (ability.castEfficiency.maxCasts) {
      // maxCasts expects cooldown in seconds
      rawMaxCasts = ability.castEfficiency.maxCasts(cooldown);
    } else if (averageCooldown) {
      // no average CD if spell hasn't been cast
      rawMaxCasts =
        availableFightDuration /
        (averageCooldown + averageTimeSpentCasting + averageTimeWaitingOnGCD) +
        (ability.charges || 1) - 1;
    } else if (!includeNoCooldownEfficiency) {
      rawMaxCasts = availableFightDuration / cooldownMs! + (ability.charges || 1) - 1;
    } else if (casts > 0) {
      let averagetimeSpentOnNoCooldownAbility =
        this._getTimeSpentCasting(ability.primarySpell.id) / casts;
      const gcd = this.getGcd(ability.gcd);
      if (gcd && averagetimeSpentOnNoCooldownAbility < gcd) {
        // edge case for no cast time spells and spells with cast time lower than the gcd.
        averagetimeSpentOnNoCooldownAbility = gcd;
      }
      rawMaxCasts =
        availableFightDuration / averagetimeSpentOnNoCooldownAbility;
    } else {
      // If we don't have any way to tell the cast time of the spell, return null.
      rawMaxCasts = undefined;
    }

    // Shouldn't this floor it?
    const maxCasts = Math.ceil(rawMaxCasts || 0);

    let efficiency;
    if (ability.castEfficiency.maxCasts) {
      // legacy support for custom maxCasts
      efficiency = Math.min(1, ((casts / rawMaxCasts!) || 0));
    } else {
      // Cast efficiency calculated as the percent of fight time spell was unavailable
      // The spell is considered unavailable if it is on cooldown, the time since it came off cooldown is less than the cast time or the cooldown was reset through a proc during a GCD
      // Time Offset reduces the Unavailable time to account for the portion of the CD that extended beyond the end of the fight
      if (cooldown && availableFightDuration) {
        const timeOnCd =
          cdInfo.completedRechargeTime + cdInfo.endingRechargeTime;
        const lastCastTimestamp =
          cdInfo.castTimestamps[cdInfo.castTimestamps.length - 1];
        // If CD reducing effects are involved, use the average cd instead of the full length
        // This prevents issues where timeOffset is negative due to the configured cd being
        // longer than the fight length
        const offsetCd = averageCooldown ? averageCooldown : cooldown * 1000
        const timeOffset =
          lastCastTimestamp + offsetCd > availableFightDuration
            ? offsetCd - (availableFightDuration - lastCastTimestamp)
            : 0;
        const timeUnavailable =
          timeOnCd + timeSpentCasting + timeWaitingOnGCD - timeOffset;
        efficiency = timeUnavailable / availableFightDuration;
      } else if (includeNoCooldownEfficiency) {
        efficiency = casts / rawMaxCasts!;
      } else {
        efficiency = null;
      }
    }

    const recommendedEfficiency =
      ability.castEfficiency.recommendedEfficiency || DEFAULT_RECOMMENDED;
    const averageIssueEfficiency =
      ability.castEfficiency.averageIssueEfficiency ||
      recommendedEfficiency - DEFAULT_AVERAGE_DOWNSTEP;
    const majorIssueEfficiency =
      ability.castEfficiency.majorIssueEfficiency ||
      recommendedEfficiency - DEFAULT_MAJOR_DOWNSTEP;

    const gotMaxCasts = casts === maxCasts;
    const canBeImproved =
      ability.castEfficiency.suggestion &&
      efficiency !== null &&
      efficiency < recommendedEfficiency &&
      !gotMaxCasts;

    return {
      ability,
      cpm,
      casts,
      maxCasts,
      efficiency,
      recommendedEfficiency,
      averageIssueEfficiency,
      majorIssueEfficiency,
      gotMaxCasts,
      canBeImproved,
    };
  }

  suggestions(when: When) {
    const castEfficiencyInfo = this.getCastEfficiency();
    castEfficiencyInfo.forEach(abilityInfo => {
      if (
        !abilityInfo ||
        !abilityInfo.ability.castEfficiency.suggestion ||
        abilityInfo.efficiency === null ||
        abilityInfo.gotMaxCasts
      ) {
        return;
      }
      const ability = abilityInfo.ability;
      const mainSpell =
        ability.spell instanceof Array ? ability.spell[0] : ability.spell;

      const suggestionThresholds = {
        actual: abilityInfo.efficiency,
        isLessThan: {
          minor: abilityInfo.recommendedEfficiency,
          average: abilityInfo.averageIssueEfficiency,
          major: abilityInfo.majorIssueEfficiency,
        },
        style: ThresholdStyle.PERCENTAGE,
      };

      when(suggestionThresholds).addSuggestion(
        (suggest, actual, recommended) => suggest(
          <>
            <Trans id="shared.modules.castEfficiency.suggest">
              Try to cast <SpellLink id={mainSpell.id} /> more often.
            </Trans>{' '}
            {ability.castEfficiency.extraSuggestion || ''}
          </>,
        )
          .icon(mainSpell.icon)
          .actual(
            <Trans id="shared.modules.castEfficiency.actual">
              {abilityInfo.casts} out of {abilityInfo.maxCasts} possible
              casts. You kept it on cooldown {formatPercentage(actual, 0)}% of
              the time.
            </Trans>,
          )
          .recommended(
            <Trans id="shared.modules.castEfficiency.recommended">
              &gt;{formatPercentage(recommended, 0)}% is recommended
            </Trans>,
          )
          .staticImportance(ability.castEfficiency.importance || null),
      );
    });
  }

  statistic() {
    return (
      <Panel title={<Trans id="common.abilities">Abilities</Trans>} position={500} pad={false}>
        <CastEfficiencyComponent
          categories={
            (this.abilities.constructor as typeof Abilities).SPELL_CATEGORIES
          }
          abilities={this.getCastEfficiency()}
        />
      </Panel>
    );
  }
}

export default CastEfficiency;
