import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import Events from 'parser/core/Events';
import { formatNumber } from 'common/format';

const WHITELIST = [
  SPELLS.ICICLE_DAMAGE,
  SPELLS.ICE_LANCE_DAMAGE,
  SPELLS.BLIZZARD_DAMAGE,
  SPELLS.FLURRY_DAMAGE,
  SPELLS.FROSTBOLT_DAMAGE,
  SPELLS.FROZEN_ORB_DAMAGE,
  SPELLS.COMET_STORM_DAMAGE,
  SPELLS.GLACIAL_SPIKE_DAMAGE,
  SPELLS.FROST_NOVA,
  SPELLS.EBONBOLT_DAMAGE,
  SPELLS.GLACIAL_ASSAULT_DAMAGE,
  SPELLS.CONE_OF_COLD,
  SPELLS.RAY_OF_FROST_TALENT,
  SPELLS.ICE_NOVA_TALENT,
  SPELLS.WATERBOLT,
];

const MOD_PER_STACK = 0.005;
class BoneChilling extends Analyzer {

  totalDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BONE_CHILLING_TALENT.id);
    if (this.active) {
      this.addEventListener(Events.damage.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(WHITELIST), this.onAffectedDamage);
    }
  }

  onAffectedDamage(event) {
    const buffInfo = this.selectedCombatant.getBuff(SPELLS.BONE_CHILLING_BUFF.id);
    if (!buffInfo) {
      return;
    }
    const mod = buffInfo.stacks * MOD_PER_STACK;
    const increase = calculateEffectiveDamage(event, mod);
    this.totalDamage += increase;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BONE_CHILLING_TALENT.id}
        position={STATISTIC_ORDER.UNIMPORTANT()}
        value={this.owner.formatItemDamageDone(this.totalDamage)}
        tooltip={`Total damage increase: ${formatNumber(this.totalDamage)}`}
      />
    );
  }

}

export default BoneChilling;
