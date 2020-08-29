import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { EnergizeEvent } from 'parser/core/Events';

/**
 * Barbed Shot generates 8 additional Focus over its duration.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/mzL4dhMRbwtXaBJf#fight=15&type=resources&spell=102&source=114
 */

const SCENT_OF_BLOOD_INCREASE_PER_TICK = 2;
const BASELINE_BARBED_REGEN_PER_TICK = 5;

const BARBED_SHOT_GENERATORS = [
  SPELLS.BARBED_SHOT_BUFF,
  SPELLS.BARBED_SHOT_BUFF_STACK_2,
  SPELLS.BARBED_SHOT_BUFF_STACK_3,
  SPELLS.BARBED_SHOT_BUFF_STACK_4,
  SPELLS.BARBED_SHOT_BUFF_STACK_5,
  SPELLS.BARBED_SHOT_BUFF_STACK_6,
  SPELLS.BARBED_SHOT_BUFF_STACK_7,
  SPELLS.BARBED_SHOT_BUFF_STACK_8,
];

class ScentOfBlood extends Analyzer {

  damage = 0;
  focusGained = 0;
  focusWastedFromBS = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SCENT_OF_BLOOD_TALENT.id);
    this.addEventListener(Events.energize.to(SELECTED_PLAYER).spell(BARBED_SHOT_GENERATORS), this.onBarbEnergize);
  }

  onBarbEnergize(event: EnergizeEvent) {
    if (event.waste >= SCENT_OF_BLOOD_INCREASE_PER_TICK) {//No focus gain from the talent
      this.focusWastedFromBS += SCENT_OF_BLOOD_INCREASE_PER_TICK;
      return;
    }
    this.focusGained += event.resourceChange - BASELINE_BARBED_REGEN_PER_TICK - event.waste;
    this.focusWastedFromBS += event.waste;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.SCENT_OF_BLOOD_TALENT}>
          <>
            {this.focusGained}/{this.focusWastedFromBS + this.focusGained} <small>focus gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ScentOfBlood;
