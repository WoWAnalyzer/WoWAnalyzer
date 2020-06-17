import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const COOLDOWN_REDUCTION_MS = 1500;

class CrusadersMight extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    statTracker: StatTracker,
  };

  effectiveHolyShockReductionMs = 0;
  wastedHolyShockReductionMs = 0;
  wastedHolyShockReductionCount = 0;
  holyShocksCastsLost = 0;

  effectiveLightOfDawnReductionMs = 0;
  wastedLightOfDawnReductionMs = 0;
  wastedLightOfDawnReductionCount = 0;
  lightOfDawnCastsLost = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE),
      this.onCast,
    );
  }

  onCast(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CRUSADER_STRIKE.id) {
      return;
    }

    const holyShockisOnCooldown = this.spellUsable.isOnCooldown(SPELLS.HOLY_SHOCK_CAST.id);
    if (holyShockisOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(
        SPELLS.HOLY_SHOCK_CAST.id,
        COOLDOWN_REDUCTION_MS,
      );
      this.effectiveHolyShockReductionMs += reductionMs;
      this.wastedHolyShockReductionMs += COOLDOWN_REDUCTION_MS - reductionMs;
    } else {
      const holyShockCooldown =
        9000 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating));
      if (
        this.selectedCombatant.hasTalent(SPELLS.SANCTIFIED_WRATH_TALENT.id) &&
        this.selectedCombatant.hasBuff(SPELLS.AVENGING_WRATH.id, event.timestamp)
      ) {
        this.holyShocksCastsLost += 1;
      } else {
        this.holyShocksCastsLost += COOLDOWN_REDUCTION_MS / holyShockCooldown;
      }
      this.wastedHolyShockReductionMs += COOLDOWN_REDUCTION_MS;
      this.wastedHolyShockReductionCount += 1;

      // mark the event on the timeline //
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = (
        <Trans>
          Holy Shock was off cooldown when you cast Crusader Strike. You should cast Holy Shock
          before Crusader Strike for maximum healing or damage.
        </Trans>
      );
    }

    const lightOfDawnisOnCooldown = this.spellUsable.isOnCooldown(SPELLS.LIGHT_OF_DAWN_CAST.id);
    if (lightOfDawnisOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(
        SPELLS.LIGHT_OF_DAWN_CAST.id,
        COOLDOWN_REDUCTION_MS,
      );
      this.effectiveLightOfDawnReductionMs += reductionMs;
      this.wastedLightOfDawnReductionMs += COOLDOWN_REDUCTION_MS - reductionMs;
      return;
    }

    // for glimmer if wings is up prioritize Holy Shock > Crusader Strike > Light of Dawn
    const wingsUp = this.selectedCombatant.hasBuff(SPELLS.AVENGING_WRATH.id, event.timestamp);
    if (this.owner.builds.GLIMMER.active && wingsUp && holyShockisOnCooldown) {
      return;
    }

    if (!lightOfDawnisOnCooldown) {
      const lightOfDawnCooldown =
        15000 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating));
      this.wastedLightOfDawnReductionMs += COOLDOWN_REDUCTION_MS;
      this.wastedLightOfDawnReductionCount += 1;
      this.lightOfDawnCastsLost += COOLDOWN_REDUCTION_MS / lightOfDawnCooldown;
    }
  }

  get holyShocksMissedThresholds() {
    return {
      actual: this.wastedHolyShockReductionCount,
      isGreaterThan: {
        minor: 0,
        average: 2,
        major: 5,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    if (this.owner.builds.GLIMMER.active) {
      when(this.holyShocksMissedThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <>
            You cast <SpellLink id={SPELLS.CRUSADER_STRIKE.id} />{' '}
            {this.wastedHolyShockReductionCount} times when
            <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> was off cooldown.{' '}
            <SpellLink id={SPELLS.CRUSADER_STRIKE.id} /> should be used to reduce the cooldown of
            <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> and should never be cast when{' '}
            <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> is avalible. This is a core component of
            the <SpellLink id={SPELLS.GLIMMER_OF_LIGHT.id} />{' '}
            <a
              href="https://questionablyepic.com/glimmer-of-light/"
              target="_blank"
              rel="noopener noreferrer"
            >
              build.
            </a>
          </>,
        )
          .icon(SPELLS.HOLY_SHOCK_CAST.icon)
          .actual(
            `${Math.floor(this.holyShocksCastsLost)} Holy Shock cast${
              Math.floor(this.holyShocksCastsLost) === 1 ? '' : 's'
            } missed.`,
          )
          .recommended(`Casting Holy Shock on cooldown is recommended.`);
      });
    }
  }

  statistic() {
    const formatSeconds = seconds => <Trans>{seconds}s</Trans>;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(75)}
        icon={<SpellIcon id={SPELLS.CRUSADERS_MIGHT_TALENT.id} />}
        value={
          <>
            {formatSeconds((this.effectiveHolyShockReductionMs / 1000).toFixed(1))}{' '}
            <SpellIcon
              id={SPELLS.HOLY_SHOCK_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />{' '}
            {formatSeconds((this.effectiveLightOfDawnReductionMs / 1000).toFixed(1))}{' '}
            <SpellIcon
              id={SPELLS.LIGHT_OF_DAWN_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </>
        }
        label={<Trans>Cooldown reduction</Trans>}
        tooltip={
          <>
            You cast Crusader Strike <b>{this.wastedHolyShockReductionCount}</b> time
            {this.wastedHolyShockReductionCount === 1 ? '' : 's'} when Holy Shock was off cooldown.
            <br />
            This wasted <b>{(this.wastedHolyShockReductionMs / 1000).toFixed(1)}</b> seconds of Holy
            Shock cooldown reduction,
            <br />
            preventing you from <b>{Math.floor(this.holyShocksCastsLost)}</b> additional Holy Shock
            cast
            {this.holyShocksLost === 1 ? '' : 's'}.
            <br />
            <br />
            You cast Crusader Strike <b>{this.wastedLightOfDawnReductionCount}</b> time
            {this.wastedLightOfDawnReductionCount === 1 ? '' : 's'} when Light of Dawn
            {this.owner.builds.GLIMMER.active ? ' and Holy Shock were' : ' was'} off cooldown.
            <br />
            This wasted <b>{(this.wastedLightOfDawnReductionMs / 1000).toFixed(1)}</b> seconds of
            Light of Dawn cooldown reduction,
            <br />
            preventing you from <b>{Math.floor(this.lightOfDawnCastsLost)}</b> additional Light of
            Dawn cast
            {this.lightOfDawnCastsLost > 2 ? 's' : ''}.
          </>
        }
      />
    );
  }
}

export default CrusadersMight;
