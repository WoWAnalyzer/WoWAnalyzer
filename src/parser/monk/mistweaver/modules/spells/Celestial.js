import React from 'react';
import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

const debug = false;

class Celestial extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
  };

  petID = null;
  _pets = {};
  soothHealing = 0;
  soothOverHealing = 0;
  envelopHealing = 0;
  evelopOverhealing = 0;
  soothCasts = 0;
  envelopCasts = 0;
  healing = 0;
  overhealing = 0;
  casts = 0;
  count = 0;

  constructor(...args) {
    super(...args);
    this.active = true;
    this._pets = this.owner.report.friendlyPets.filter(pet => pet.petOwner === this.owner.player.id);
  }

  on_byPlayer_summon(event) {
    if (event.ability.guid === SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id) {
      this.petID = event.targetID;
      debug && console.log(`Chi-Ji Summoned: ${this.petID}`);
    } else {
      this.petID = event.targetID;
      debug && console.log(`Yu'lon Summoned: ${this.petID}`);
    }
  }

  on_heal(event) {
     if (event.ability.guid === SPELLS.ENVELOPING_BREATH.id) {
        this.healingDone._total = this.healingDone._total.add(event.amount || 0, event.absorbed || 0, event.overheal || 0);

        this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
        this.evelopOverhealing += event.overheal || 0;
        this.soothCasts += 1;
    }
    if (event.sourceID === this.petID && event.ability.guid === SPELLS.SOOTHING_BREATH.id) {
      this.healingDone._total = this.healingDone._total.add(event.amount || 0, event.absorbed || 0, event.overheal || 0);

      this.soothHealing += (event.amount || 0) + (event.absorbed || 0);
      this.soothOverHealing += event.overheal || 0;
      this.envelopCasts += 1;
   }
   this.casts = this.soothCasts + this.envelopCasts;
   this.healing = this.soothHealing + this.envelopHealing;
  }

  get soothingOverHealing() {
    return (this.soothOverHealing / (this.soothHealing + this.soothOverHealing)).toFixed(4) || 0;
  }

  get envelopOverHealing() {
    return (this.evelopOverhealing / (this.envelopHealing + this.evelopOverhealing)).toFixed(4) || 0;
  }

  statistic() {
    return (
      <>
        <StatisticBox
          position={STATISTIC_ORDER.OPTIONAL(50)}
          icon={<SpellIcon id={SPELLS.SOOTHING_BREATH.id} />}
          value={`${formatNumber(this.soothHealing)}`}
          label={(
            <TooltipElement content="This is the effective healing contributed by Soothing Breath.">
              Healing Contributed
            </TooltipElement>
          )}
        />
        <StatisticBox
          position={STATISTIC_ORDER.OPTIONAL(50)}
          icon={<SpellIcon id={SPELLS.ENVELOPING_BREATH.id} />}
          value={`${formatNumber(this.envelopHealing)}`}
          label={(
            <TooltipElement content="This is the effective healing contributed by the Enveloping Breath.">
              Healing Contributed
            </TooltipElement>
          )}
        />
      </>
    )
  }

  on_fightend() {
    if (debug) {
      console.log(`Celestial ID: ${this.petID}`);
    }
  }
}

export default Celestial;
