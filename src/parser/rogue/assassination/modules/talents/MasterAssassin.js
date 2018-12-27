import React from 'react';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import StatTracker from 'parser/shared/modules/StatTracker';

import StealthCasts from './StealthCasts';
import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../constants';

const CRIT_BONUS = 0.5;

const CASTS_POSSIBLE = 3;
const GOOD_MASTER_ASSASSIN_ABILITIES = [
  SPELLS.MUTILATE.id,
  SPELLS.ENVENOM.id,
  SPELLS.FAN_OF_KNIVES.id,
];
const GOOD_OPENER_CASTS = [
  ...GOOD_MASTER_ASSASSIN_ABILITIES,
  SPELLS.GARROTE.id,
  SPELLS.RUPTURE.id,
];

class MasterAssassin extends StealthCasts {
  static dependencies = {
    statTracker: StatTracker,
  };

  bonusDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_ASSASSIN_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES), this.addBonusDamageIfBuffed);
  }

  addBonusDamageIfBuffed(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.MASTER_ASSASSIN_BUFF.id)) {
      return;
    }
    const critChance = this.statTracker.currentCritPercentage;
    const critBonusFromMasterAssassin = Math.min(CRIT_BONUS, 1 - critChance);
    const damageBonus = critBonusFromMasterAssassin / (1 + critBonusFromMasterAssassin + critChance);
    this.bonusDamage += calculateEffectiveDamage(event, damageBonus);
  }

  get goodStealthCasts() {
    let goodCasts = 0;
    this.stealthSequences.forEach(sequence => {
      const goodSpells = (this.usedStealthOnPull && sequence === this.stealthSequences[0]) ? GOOD_OPENER_CASTS : GOOD_MASTER_ASSASSIN_ABILITIES;
      let goodCastsSeq = 0;
      sequence.forEach(e => {
        if (goodSpells.includes(e.ability.guid)) {
          goodCastsSeq += 1;
        }
      });
      goodCasts += Math.min(goodCastsSeq, CASTS_POSSIBLE);
    });
    return goodCasts;
  }

  get stealthCasts() {
    return this.stealthSequences.length;
  }

  get percentGoodCasts() {
    return (this.goodStealthCasts / (this.stealthCasts * CASTS_POSSIBLE)) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentGoodCasts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You failed to take full advantage of <SpellLink id={SPELLS.MASTER_ASSASSIN_TALENT.id} />. Make sure to prioritize spending the buff on <SpellLink id={SPELLS.MUTILATE.id} /> or <SpellLink id={SPELLS.ENVENOM.id} /> (<SpellLink id={SPELLS.FAN_OF_KNIVES.id} /> is acceptable for AOE). During your opener <SpellLink id={SPELLS.GARROTE.id} /> and <SpellLink id={SPELLS.RUPTURE.id} /> is also okay.</>)
        .icon(SPELLS.MASTER_ASSASSIN_TALENT.icon)
        .actual(`${formatPercentage(actual)}% good casts during Master Assassin`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.MASTER_ASSASSIN_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(2)}
        value={<ItemDamageDone amount={this.bonusDamage} />}
      />
    );
  }

}

export default MasterAssassin;
