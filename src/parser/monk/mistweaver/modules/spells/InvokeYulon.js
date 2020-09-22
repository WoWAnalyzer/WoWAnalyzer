import React from 'react';
import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';

import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

const debug = false;

class InvokeYulon extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  petID = null;
  soothHealing = 0;
  envelopHealing = 0;
  healing = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH), this.handleEnvelopingBreath);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_BREATH), this.handleSoothingBreath);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.handleSummon);
    debug && this.addEventListener(Events.fightend, this.fightEndDebug);
  }

  handleSummon(event) {
    this.petID = event.targetID;
    debug && console.log(`${event.ability.guid === SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id ? 'Chi-Ji' : 'Yu\'lon'} Summoned: ${this.petID}`);
  }

  handleEnvelopingBreath(event) {
    this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleSoothingBreath(event) {
    this.soothHealing += (event.amount || 0) + (event.absorbed || 0);
  }
  
  fightEndDebug() {
    console.log(`Yu'lon ID: ${this.petID}`);
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
            value={`${formatNumber(this.soothHealing + this.envelopHealing)}`}
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
}

export default InvokeYulon;
