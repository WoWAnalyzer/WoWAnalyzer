import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import SpellIcon from 'common/SpellIcon';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

/**
 * Barbed Shot generates 8 additional Focus over its duration.
 *
 * Example log: https://www.warcraftlogs.com/reports/jV7BJPN81AqtDKYp#fight=9&source=167&type=damage-done
 */

const SCENT_OF_BLOOD_INCREASE_PER_TICK = 2;
const BASELINE_BARBED_REGEN_PER_TICK = 5;
// Currently Scent of Blood also affects Dire Beast focus regen - but since Barbed Shot ticks 4 times, it gives 2 extra focus per tick
// however Dire Beast only ticks once we only get 2 additional focus from that instead of the full 8
const BASELINE_DIRE_BEAST_REGEN = 10;

const BARBED_SHOT_GENERATORS = [
  SPELLS.BARBED_SHOT_BUFF.id,
  SPELLS.BARBED_SHOT_BUFF_STACK_2.id,
  SPELLS.BARBED_SHOT_BUFF_STACK_3.id,
  SPELLS.BARBED_SHOT_BUFF_STACK_4.id,
  SPELLS.BARBED_SHOT_BUFF_STACK_5.id,
];

class ScentOfBlood extends Analyzer {

  damage = 0;
  focusGained = 0;
  focusWastedFromBS = 0;
  focusWastedFromDB = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SCENT_OF_BLOOD_TALENT.id);
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (!BARBED_SHOT_GENERATORS.includes(spellId) && spellId !== SPELLS.DIRE_BEAST_GENERATOR.id) {
      return;
    }
    if (spellId === SPELLS.DIRE_BEAST_GENERATOR.id) {
      if (event.waste >= SCENT_OF_BLOOD_INCREASE_PER_TICK) { //No focus gain from the talent
        this.focusWastedFromDB += SCENT_OF_BLOOD_INCREASE_PER_TICK;
        return;
      }
      this.focusGained += event.resourceChange - BASELINE_DIRE_BEAST_REGEN - event.waste;
      this.focusWastedFromDB += event.waste;
      return;
    }
    if (event.waste >= SCENT_OF_BLOOD_INCREASE_PER_TICK) {//No focus gain from the talent
      this.focusWastedFromBS += SCENT_OF_BLOOD_INCREASE_PER_TICK;
      return;
    }
    this.focusGained += event.resourceChange - BASELINE_BARBED_REGEN_PER_TICK - event.waste;
    this.focusWastedFromBS += event.waste;
  }

  statistic() {
    return (
      <TalentStatisticBox
        icon={<SpellIcon id={SPELLS.SCENT_OF_BLOOD_TALENT.id} />}
        value={
          <>
            gained {this.focusGained} focus <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} />
          </>
        }
        label="Scent of Blood"
        tooltip={`
            <ul>
            <li>You wasted ${this.focusWastedFromBS} focus by being too close to focus cap when Barbed Shot gave you focus.</li>
            ${this.selectedCombatant.hasTalent(SPELLS.DIRE_BEAST_TALENT.id) ? `<li> You wasted ${this.focusWastedFromDB} focus by being too close to focus cap when Dire Beast gave you focus.</li>` : ``}
            </ul>`}
      />
    );
  }

}

export default ScentOfBlood;
