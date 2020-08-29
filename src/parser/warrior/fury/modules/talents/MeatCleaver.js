import React from 'react';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import SPELLS from 'common/SPELLS';

const BUFFER_MS = 50;

const RAGE_GAIN_WW_ON_USE = 3;
const RAGE_GAIN_WW_ON_HIT = 1;
const WW_ON_HIT_RAGE_CAP = 5;

class MeatCleaver extends Analyzer {
  whirlwindEvents = [];
  lastWhirlwindCast = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MEAT_CLEAVER_TALENT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.energize.to(SELECTED_PLAYER).spell(SPELLS.WHIRLWIND_FURY_ENERGIZE), this.onWhirlwindEnergize);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.WHIRLWIND_FURY_DAMAGE_MH, SPELLS.WHIRLWIND_FURY_DAMAGE_OH]), this.onWhirlwindDamage);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.ENRAGE), this.onEnrage);
  }

  // The Energize event ligns up with the cast, so using it for both the rage gain, and timings of the cast.
  onWhirlwindEnergize(event) {
    this.lastWhirlwindCast = event.timestamp;
    this.whirlwindEvents[this.lastWhirlwindCast] = {
      resourceChange: event.resourceChange,
      triggeredEnrage: false,
      targetsHit: 0,
      isFirstRoundOfDamage: true,
      hasRecklessness: this.selectedCombatant.hasBuff(SPELLS.RECKLESSNESS.id),
    };
  }

  onEnrage(event) {
    if (event.timestamp - this.lastWhirlwindCast <= BUFFER_MS) {
      this.whirlwindEvents[this.lastWhirlwindCast].triggeredEnrage = true;
    }
  }

  onWhirlwindDamage(event) {
    // Whirlwind triggers damage 3 times. We only need to count the number of targets hit on the first set of MH damage
    if (this.whirlwindEvents[this.lastWhirlwindCast].isFirstRoundOfDamage) {
      if (event.ability.guid === SPELLS.WHIRLWIND_FURY_DAMAGE_MH.id) {
        this.whirlwindEvents[this.lastWhirlwindCast].targetsHit += 1;
      } else {
        this.whirlwindEvents[this.lastWhirlwindCast].isFirstRoundOfDamage = false;
      }
    }
  }

  get numberOfEnrageTriggers() {
    return this.whirlwindEvents.filter(e => e.triggeredEnrage).length;
  }

  get rageGainedByMeatCleaver() {
    return this.whirlwindEvents.reduce((total, event) => {
      const rageGained = event.resourceChange;
      // WW generates 3 rage on cast (6 during recklessness). Subtract this to get rage gained from hitting targets
      const rageFromHit = rageGained - (event.hasRecklessness ? RAGE_GAIN_WW_ON_USE * 2 : RAGE_GAIN_WW_ON_USE);
      // WW generates 1 rage per target hit (2 during recklessness) up to 5 targets. Subtract this to get rage gained from trait
      const rageFromMeatCleaver = rageFromHit - (event.targetsHit > WW_ON_HIT_RAGE_CAP ? WW_ON_HIT_RAGE_CAP : event.targetsHit) * (event.hasRecklessness ? RAGE_GAIN_WW_ON_HIT * 2 : RAGE_GAIN_WW_ON_HIT);
      // Due to calculating this backwards, if WW was cast near to full rage, rageFromMeatCleaver could be negative but should just be 0.
      return rageFromMeatCleaver < 0 ? total : total + rageFromMeatCleaver;
    }, 0);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.MEAT_CLEAVER_TALENT.id}
        value={`${this.rageGainedByMeatCleaver} rage gained`}
        label="Meat Cleaver"
        tooltip={<>Enrage was triggered <strong>{this.numberOfEnrageTriggers}</strong> times by Meat Cleaver.</>}
      />
    );
  }
}

export default MeatCleaver;
