import React from 'react';
import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';

import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

const debug = false;

class Celestial extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  petID = null;
  _pets = {};
  soothHealing = 0;
  soothOverHealing = 0;
  envelopHealing = 0;
  evelopOverhealing = 0;
  healing = 0;
  overhealing = 0;
  count = 0;

  constructor(...args) {
    super(...args);
    this._pets = this.owner.report.friendlyPets.filter(pet => pet.petOwner === this.owner.player.id);
  }

  on_byPlayer_summon(event) {
    this.petID = event.targetID;
    debug && console.log(`${event.ability.guid === SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id ? 'Chi-Ji' : 'Yu\'lon'} Summoned: ${this.petID}`);
  }

  on_heal(event) {
    if (event.ability.guid === SPELLS.ENVELOPING_BREATH.id) {
      this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
      this.evelopOverhealing += event.overheal || 0;
    }
    if (event.sourceID === this.petID && event.ability.guid === SPELLS.SOOTHING_BREATH.id) {
      this.soothHealing += (event.amount || 0) + (event.absorbed || 0);
      this.soothOverHealing += event.overheal || 0;
    }
    this.healing = this.soothHealing + this.envelopHealing;
  }

  statistic() {
    if (!this.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id)) {
      return (
        <>
          <StatisticBox
            position={STATISTIC_ORDER.OPTIONAL(50)}
            icon={<SpellIcon id={SPELLS.SOOTHING_BREATH.id} />}
            value={`${formatNumber(this.soothHealing)}`}
            label={(
              <TooltipElement content="This is the effective healing contributed by Soothing Breath.">
                Soothing Breath Healing
              </TooltipElement>
            )}
          />
          <StatisticBox
            position={STATISTIC_ORDER.OPTIONAL(50)}
            icon={<SpellIcon id={SPELLS.ENVELOPING_BREATH.id} />}
            value={`${formatNumber(this.envelopHealing)}`}
            label={(
              <TooltipElement content="This is the effective healing contributed by the Enveloping Breath.">
                Enveloping Breath Healing
              </TooltipElement>
            )}
          />
          <StatisticBox
            position={STATISTIC_ORDER.OPTIONAL(50)}
            icon={<><SpellIcon id={SPELLS.ENVELOPING_BREATH.id} /><SpellIcon id={SPELLS.SOOTHING_BREATH.id} /></>}
            value={`${formatNumber(this.healing)}`}
            label={(
              <TooltipElement content="This is the effective healing contributed by both Enveloping & Soothing Breath.">
                Total Healing Contributed
              </TooltipElement>
            )}
          />
        </>
      );
    } 
    return <span />;
  }

  on_fightend() {
    if (debug) {
      console.log(`Celestial ID: ${this.petID}`);
    }
  }
}

export default Celestial;
