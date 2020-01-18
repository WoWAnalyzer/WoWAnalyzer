import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import EnemyInstances, { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

class IceLanceNoIL extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
    abilityTracker: AbilityTracker,
  };

  iceLanceCastTimestamp = 0;
  iceLanceCastTarget = 0;
  hadFingersFrostProc = false;
  goodIceLance = 0;

  constructor(...args) {
    super(...args);
    this.active = this.owner.builds.NO_IL.active;
    this.hasSplittingIce = this.selectedCombatant.hasTalent(SPELLS.SPLITTING_ICE_TALENT.id);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ICE_LANCE), this.onIceLanceCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ICE_LANCE_DAMAGE), this.onIceLanceDamage);
  }

  onIceLanceCast(event) {
    this.iceLanceCastTimestamp = event.timestamp;
    if (event.targetID) {
      this.iceLanceCastTarget = encodeTargetString(event.targetID, event.targetInstance);
    }
    this.hadFingersFrostProc = false;
    if (this.selectedCombatant.hasBuff(SPELLS.FINGERS_OF_FROST.id)) {
      this.hadFingersFrostProc = true;
    }
  }

  onIceLanceDamage(event) {
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    
    if (this.hasSplittingIce && this.hadFingersFrostProc && this.iceLanceCastTarget !== damageTarget) {
      this.goodIceLance += 1;
    }
  }

  get totalIceLanceCasts() {
    return this.abilityTracker.getAbility(SPELLS.ICE_LANCE.id).casts;
  }

  get iceLanceEfficiency() {
    return this.goodIceLance / this.totalIceLanceCasts;
  }

  get badIceLance() {
    return this.totalIceLanceCasts - this.goodIceLance;
  }

  get iceLanceNoILSuggestionThresholds() {
    return {
      actual: this.iceLanceEfficiency,
      isLessThan: {
        minor: 1,
        average: .9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.iceLanceNoILSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You cast <SpellLink id={SPELLS.ICE_LANCE.id} /> {this.badIceLance} times improperly. The only time you should be casting Ice Lance is if you have a <SpellLink id={SPELLS.FINGERS_OF_FROST.id} /> proc and it will cleave via <SpellLink id={SPELLS.SPLITTING_ICE_TALENT.id} />. It is also acceptable to cast Ice Lance if you are moving and cannot cast anything else instead, but if you are doing this a lot then you are likely moving too much.</>)
          .icon(SPELLS.ICE_LANCE.icon)
          .actual(`${formatPercentage(this.iceLanceEfficiency)}% efficiency`)
          .recommended(`<${formatPercentage(recommended)} is recommended`);
      });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={'This is your Ice Lance cast efficiency for the No Ice Lance Build. The only time you should be casting Ice Lance while playing this build is if you have a Fingers of Frost proc and the Ice Lance will cleave via Splitting Ice. Additionally, it is acceptable to cast Ice Lance if you are moving and cannot cast anything else instead, but if you are doing this a lot then you are probably moving too much and should work on minimizing the amount of time you are moving.'}
      >
        <BoringSpellValueText spell={SPELLS.ICE_LANCE}>
          {this.totalIceLanceCasts} <small>Total Casts</small><br />
          {formatPercentage(this.iceLanceEfficiency,2)}% <small>Cast efficiency</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IceLanceNoIL;
