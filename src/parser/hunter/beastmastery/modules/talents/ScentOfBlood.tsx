import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import { EnergizeEvent } from '../../../../core/Events';

/**
 * Barbed Shot generates 8 additional Focus over its duration.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/DFZVfmhkj9bYa6rn#fight=1&type=damage-done
 */

const SCENT_OF_BLOOD_INCREASE_PER_TICK = 2;
const BASELINE_BARBED_REGEN_PER_TICK = 5;

const BARBED_SHOT_GENERATORS = [
  SPELLS.BARBED_SHOT_BUFF.id,
  SPELLS.BARBED_SHOT_BUFF_STACK_2.id,
  SPELLS.BARBED_SHOT_BUFF_STACK_3.id,
  SPELLS.BARBED_SHOT_BUFF_STACK_4.id,
  SPELLS.BARBED_SHOT_BUFF_STACK_5.id,
  SPELLS.BARBED_SHOT_BUFF_STACK_6.id,
  SPELLS.BARBED_SHOT_BUFF_STACK_7.id,
  SPELLS.BARBED_SHOT_BUFF_STACK_8.id,
];

class ScentOfBlood extends Analyzer {

  damage = 0;
  focusGained = 0;
  focusWastedFromBS = 0;

  constructor(options: any) {
    super(options);
    this.active
      = this.selectedCombatant.hasTalent(SPELLS.SCENT_OF_BLOOD_TALENT.id);
  }

  on_toPlayer_energize(event: EnergizeEvent) {
    const spellId = event.ability.guid;
    if (!BARBED_SHOT_GENERATORS.includes(spellId)) {
      return;
    }
    if (event.waste >= SCENT_OF_BLOOD_INCREASE_PER_TICK) {//No focus gain from the talent
      this.focusWastedFromBS += SCENT_OF_BLOOD_INCREASE_PER_TICK;
      return;
    }
    this.focusGained += event.resourceChange -
      BASELINE_BARBED_REGEN_PER_TICK -
      event.waste;
    this.focusWastedFromBS += event.waste;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={'TALENTS'}
        tooltip={(
          <>
            <ul>
              <li>You wasted {this.focusWastedFromBS} focus by being too close to focus cap when Barbed Shot gave you focus.</li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SCENT_OF_BLOOD_TALENT}>
          <>
            {this.focusGained} <small>focus gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ScentOfBlood;
