import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import Enemies from 'Parser/Core/Modules/Enemies';


import DualStatisticBox, { STATISTIC_ORDER } from 'Main/DualStatisticBox';
import { formatPercentage, formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import isAtonement from '../Core/isAtonement';
import Penance from '../Spells/Penance';
import AtonementDamageSource from '../Features/AtonementDamageSource';

import { calculateOverhealing, SmiteEstimation } from '../../SpellCalculations';

class Schism extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
    statTracker: StatTracker,
    atonementDamageSource: AtonementDamageSource,
    penance: Penance,
  };

  // Spell metadata
  static bonus = 0.4;
  static duration = 9000;
  static synergisticAbilities = [
    SPELLS.HALO_TALENT.id,
    SPELLS.POWER_WORD_SOLACE_TALENT.id,
    SPELLS.PENANCE.id,
  ];

  // Privates
  _lastSchismCast = 0;
  _badSchisms = {};

  // Schism data
  directDamage = 0;
  damageFromBuff = 0;
  healing = 0;
  target = null;

  // Estimations
  smiteEstimation;

  // Methods
  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasTalent(
      SPELLS.SCHISM_TALENT.id
    );

    this.smiteEstimation = SmiteEstimation(this.statTracker);
  }

  get buffActive() {
    return this.target && this.target.hasBuff(SPELLS.SCHISM_TALENT.id);
  }

  get badSchismCount() {
    return Object.entries(this._badSchisms).reduce((n, [e, isBadSchism]) => (n += (isBadSchism ? 1 : 0)), 0);
  }

  on_byPlayer_damage(event) {
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
    this._badSchisms[event] = true;

    // Add direct schism damage
    const { smiteDamage } = this.smiteEstimation();

    this.directDamage += event.amount - smiteDamage;
  }

  on_byPlayer_heal(event) {
    if (!isAtonement(event)) return;
    const atonenementDamageEvent = this.atonementDamageSource.event;

    // Schism doesn't buff itself, but we need to handle this for better estimations
    if (atonenementDamageEvent.ability.guid === SPELLS.SCHISM_TALENT.id) {
      this.processSchismAtonement(event);
      return;
    }

    // If the Schism debuff isn't active, or the damage isn't our target we don't process it
    if (
      !this.buffActive ||
      atonenementDamageEvent.targetID !== this.target.id
    ) {
      return;
    }

    // Schism doesn't buff pet damage - yet
    if (this.owner.byPlayerPet(this.atonementDamageSource.event)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, Schism.bonus);
  }

  // Flags a Schism as being bad due to lack of synergistic abilities used
  handleSynergy(event) {
    if (!Schism.synergisticAbilities.includes(event.ability.guid)) return;
    if (this._lastSchismCast.timestamp + Schism.duration <= event.timestamp) return;
    if (!this._lastSchismCast) return;

    this._badSchisms[this._lastSchismCast] = false;
  }

  // The Atonement from Schism's direct damage component
  processSchismAtonement(event) {
    const { smiteHealing } = this.smiteEstimation();
    const estimatedSmiteRawHealing = smiteHealing * event.hitType;

    const estimatedOverhealing = calculateOverhealing(
      estimatedSmiteRawHealing,
      event.amount,
      event.overheal
    );

    const estimatedSmiteHealing =
      estimatedSmiteRawHealing - estimatedOverhealing;

    this.healing += event.amount - estimatedSmiteHealing;
  }

  // The damage from the Schism buff
  processSchismBuffDamage(event) {
    if (!this.buffActive || event.targetID !== this.target.id) {
      return;
    }

    this.damageFromBuff += calculateEffectiveDamage(event, Schism.bonus);
  }

  statistic() {
    return (
      <DualStatisticBox
        icon={<SpellIcon id={SPELLS.SCHISM_TALENT.id} />}
        values={[
          `${formatNumber(this.healing / this.owner.fightDuration * 1000)} HPS`,
          `${formatNumber(
            (this.directDamage + this.damageFromBuff) /
              this.owner.fightDuration *
              1000
          )} DPS
          `,
        ]}
        footer={
          <dfn
            data-tip={`
              The effective healing contributed by Schism was ${formatPercentage(
                this.owner.getPercentageOfTotalHealingDone(this.healing)
              )}% of total healing done.

              The direct damage contributed by the Schism talent was ${formatPercentage(
                this.owner.getPercentageOfTotalDamageDone(this.directDamage)
              )}% of total damage done.

              The effective damage contributed by the Schism bonus was ${formatPercentage(
                this.owner.getPercentageOfTotalDamageDone(this.damageFromBuff)
              )}% of total damage done.
            `}
          >
            Schism Output Details
          </dfn>
        }
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
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.badSchismThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Don't cast <SpellLink id={SPELLS.SCHISM_TALENT.id} /> without also casting <SpellLink id={SPELLS.PENANCE.id} />, <SpellLink id={SPELLS.HALO_TALENT.id} />, or <SpellLink id={SPELLS.POWER_WORD_SOLACE_TALENT.id} />  </React.Fragment>)
        .icon(SPELLS.SCHISM_TALENT.icon)
        .actual(`You cast Schism ${5} times without pairing it with strong damaging abilities, such as Penance, Halo, or Power Word: Solace.`)
        .recommended(`${recommended} is recommended`);
    });
  }
}

export default Schism;
