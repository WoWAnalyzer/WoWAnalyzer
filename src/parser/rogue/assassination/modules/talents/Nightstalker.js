import React from 'react';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import StealthCasts from './StealthCasts';
import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES, NIGHTSTALKER_BLACKLIST } from '../../constants';
import GarroteSnapshot from '../features/GarroteSnapshot';
import RuptureSnapshot from '../features/RuptureSnapshot';

const DAMAGE_BONUS = 0.5;

class Nightstalker extends StealthCasts {
  static dependencies = {
    garroteSnapshot: GarroteSnapshot,
    ruptureSnapshot: RuptureSnapshot,
  };

  bonusDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NIGHTSTALKER_TALENT.id);
    if (!this.active) {
      return;
    }
    const allowedAbilities = ABILITIES_AFFECTED_BY_DAMAGE_INCREASES.filter(spell => !NIGHTSTALKER_BLACKLIST.includes(spell));
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(allowedAbilities), this.addBonusDamageIfBuffed);
  }

  addBonusDamageIfBuffed(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STEALTH.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.STEALTH_BUFF.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.VANISH_BUFF.id)) {
      return;
    }
    this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  get bonusDamageTotal() {
    return this.bonusDamage + this.garroteSnapshot.bonusDamage + this.ruptureSnapshot.bonusDamage;
  }

  get vanishCastsSpentOnRupture() {
    let vanishWithRupture = 0;
    this.stealthSequences.forEach(sequence => {
      if (this.usedStealthOnPull && sequence === this.stealthSequences[0]) {
        return;
      }
      const firstRuptureCast = sequence.find(e => e.ability.guid === SPELLS.RUPTURE.id);
      if (firstRuptureCast) {
        vanishWithRupture += 1;
      }
    });
    return vanishWithRupture;
  }

  get goodOpenerCasts() {
    if (!this.usedStealthOnPull) {
      return false;
    }
    const RuptureOpener = this.stealthSequences[0].find(e => e.ability.guid === SPELLS.RUPTURE.id);
    const GarroteOpener = this.stealthSequences[0].find(e => e.ability.guid === SPELLS.GARROTE.id);
    if(RuptureOpener || GarroteOpener) {
      return true;
    }
    return false;
  }

  get vanishCasts() {
    return this.stealthSequences.length - (this.usedStealthOnPull ? 1 : 0);
  }

  get percentGoodVanishCasts() {
    return (this.vanishCastsSpentOnRupture / this.vanishCasts) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentGoodVanishCasts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsOpener() {
    return {
      actual: this.goodOpenerCasts,
      isEqual: false,
      style: 'boolean',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Your failed to cast <SpellLink id={SPELLS.RUPTURE.id} /> after <SpellLink id={SPELLS.VANISH.id} /> {this.vanishCasts - this.vanishCastsSpentOnRupture} time(s). Make sure to prioritize spending your Vanish on snapshotting <SpellLink id={SPELLS.RUPTURE.id} /> when using <SpellLink id={SPELLS.NIGHTSTALKER_TALENT.id} />.</>)
        .icon(SPELLS.GARROTE.icon)
        .actual(`${formatPercentage(actual)}% of Vanishes used to snapshot Rupture`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
    when(this.suggestionThresholdsOpener).isFalse().addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You failed to snapshot a <SpellLink id={SPELLS.RUPTURE.id} /> or <SpellLink id={SPELLS.GARROTE.id} /> on pull from stealth. Make sure your first cast when using <SpellLink id={SPELLS.NIGHTSTALKER_TALENT.id} /> is a <SpellLink id={SPELLS.RUPTURE.id} /> or <SpellLink id={SPELLS.GARROTE.id} />.</>)
        .icon(SPELLS.NIGHTSTALKER_TALENT.icon);
    });
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.NIGHTSTALKER_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(2)}
        value={<ItemDamageDone amount={this.bonusDamageTotal} />}
      />
    );
  }

}

export default Nightstalker;
