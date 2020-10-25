import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import DualStatisticBox, { STATISTIC_ORDER } from 'interface/others/DualStatisticBox';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { SuggestionFactory, ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemy from 'parser/core/Enemy';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import isAtonement from '../core/isAtonement';
import Penance from './Penance';
import AtonementDamageSource from '../features/AtonementDamageSource';
import { calculateOverhealing, SmiteEstimation } from '../../SpellCalculations';
import Atonement from './Atonement';
import SinsOfTheMany from './SinsOfTheMany';

class Schism extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    statTracker: StatTracker,
    atonementDamageSource: AtonementDamageSource,
    penance: Penance,
    atonement: Atonement,
    sins: SinsOfTheMany,
  };

  protected enemies!: Enemies;
  protected statTracker!: StatTracker;
  protected atonementDamageSource!: AtonementDamageSource;
  protected penance!: Penance;
  protected atonement!: Atonement;
  protected sins!: SinsOfTheMany;

  // Spell metadata
  static bonus = 0.4;
  static duration = 9000;
  static synergisticAbilities = [
    SPELLS.HALO_TALENT.id,
    SPELLS.POWER_WORD_SOLACE_TALENT.id,
    SPELLS.PENANCE.id,
  ];

  // Privates
  _lastSchismCast: DamageEvent | null = null;
  _badSchisms: any = {};

  // Schism data
  directDamage = 0;
  damageFromBuff = 0;
  healing = 0;
  target: Enemy | null = null;

  get smiteEstimation() {
    return SmiteEstimation(this.statTracker, this.sins);
  }

  // Methods
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(
      SPELLS.SCHISM_TALENT.id,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  get buffActive() {
    return this.target && this.target.hasBuff(SPELLS.SCHISM_TALENT.id);
  }

  get badSchismCount() {
    return Object.entries(this._badSchisms).reduce(
      (n, [e, isBadSchism]) => n + (isBadSchism ? 1 : 0),
      0,
    );
  }

  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;

    // Handle non-schism events
    if (spellId !== SPELLS.SCHISM_TALENT.id) {
      this.handleSynergy(event);
      this.processSchismBuffDamage(event);
      return;
    }

    // Set the target for schism
    this.target = this.enemies.getEntity(event);

    // Set the last time schism was cast
    this._lastSchismCast = event;

    // Assume every schism is bad
    this._badSchisms[event.timestamp] = true;

    // Calculate direct schism damage
    const { smiteDamage } = this.smiteEstimation();

    // Substract smite damage (because that is what we would be casting if we didn't pick Schism)
    this.directDamage += (event.amount + event.absorbed || 0) - smiteDamage;
  }

  onHeal(event: HealEvent) {
    if (!isAtonement(event)) {
      return;
    }
    const atonenementDamageEvent = this.atonementDamageSource.event;
    if (!atonenementDamageEvent) {
      this.error('Atonement damage event unknown for Atonement heal:', event);
      return;
    }

    // Schism doesn't buff itself, but we need to handle this for better estimations
    if (atonenementDamageEvent.ability.guid === SPELLS.SCHISM_TALENT.id) {
      this.processSchismAtonement(event);
      return;
    }

    // If the Schism debuff isn't active, or the damage isn't our target we don't process it
    if (!this.buffActive || !this.target || atonenementDamageEvent.targetID !== this.target.id) {
      return;
    }

    // Schism doesn't buff pet damage - yet
    if (this.atonementDamageSource.event && this.owner.byPlayerPet(this.atonementDamageSource.event)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, Schism.bonus);
  }

  // Flags a Schism as being bad due to lack of synergistic abilities used
  handleSynergy(event: DamageEvent) {
    if (!this._lastSchismCast) {
      return;
    }
    if (!Schism.synergisticAbilities.includes(event.ability.guid)) {
      return;
    }

    // Return early if the ability isn't cast during Schism
    if (this._lastSchismCast.timestamp + Schism.duration <= event.timestamp) {
      return;
    }

    this._badSchisms[this._lastSchismCast.timestamp] = false;
  }

  // The Atonement from Schism's direct damage component
  processSchismAtonement(event: HealEvent) {
    const { smiteHealing } = this.smiteEstimation();
    const estimatedSmiteRawHealing = smiteHealing * event.hitType;

    const estimatedOverhealing = calculateOverhealing(
      estimatedSmiteRawHealing,
      event.amount,
      event.overheal,
    );

    const estimatedSmiteHealing =
      estimatedSmiteRawHealing - estimatedOverhealing;

    this.healing += event.amount - estimatedSmiteHealing;
  }

  // The damage from the Schism buff
  processSchismBuffDamage(event: DamageEvent) {
    if (!this.buffActive || !this.target || event.targetID !== this.target.id) {
      return;
    }

    this.damageFromBuff += calculateEffectiveDamage(event, Schism.bonus);
  }

  statistic() {
    return (
      <DualStatisticBox
        icon={<SpellIcon id={SPELLS.SCHISM_TALENT.id} />}
        values={[
          `${formatNumber((this.healing / this.owner.fightDuration) * 1000)} HPS`,
          `${formatNumber(((this.directDamage + this.damageFromBuff) / this.owner.fightDuration) * 1000)} DPS`,
        ]}
        footer={(
          <>
            <SpellLink id={SPELLS.SCHISM_TALENT.id} /> throughput
          </>
        )}
        tooltip={(
          <>
            The effective healing contributed by Schism was {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))}% of total healing done.<br />
            The direct damage contributed by the Schism talent was {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.directDamage))}% of total damage done.<br />
            The effective damage contributed by the Schism bonus was {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageFromBuff))}% of total damage done. <br />
          </>
        )}
        alignIcon="center"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();

  get badSchismThresholds() {
    return {
      actual: this.badSchismCount,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.badSchismThresholds).addSuggestion((suggest: SuggestionFactory, actual: number, recommended: number) => suggest(
          <>
            Don't cast <SpellLink id={SPELLS.SCHISM_TALENT.id} /> without also
            casting <SpellLink id={SPELLS.PENANCE.id} />,{' '}
            <SpellLink id={SPELLS.HALO_TALENT.id} />, or{' '}
            <SpellLink id={SPELLS.POWER_WORD_SOLACE_TALENT.id} />{' '}
          </>,
        )
          .icon(SPELLS.SCHISM_TALENT.icon)
          .actual(i18n._(t('priest.discipline.suggestions.schism.efficiency')`You cast Schism ${actual} times without pairing it with strong damaging abilities, such as Penance, Halo, or Power Word: Solace.`))
          .recommended(`${recommended} is recommended`),
    );
  }
}

export default Schism;
