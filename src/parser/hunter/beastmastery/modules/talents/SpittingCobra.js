import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import SpellIcon from 'common/SpellIcon';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

/**
 *
 * Summons a Spitting Cobra for 20 sec that attacks your target for (31.2% of Attack power) Nature damage every 2 sec.
 * While the Cobra is active you gain 2 Focus every sec. * Increases the effectiveness of your pet's Predator's Thirst, Endurance Training, and Pathfinding passives by 50%.
 *
 * Example log: https://www.warcraftlogs.com/reports/jV7BJPN81AqtDKYp#fight=9&source=167&type=damage-done
 */

class SpittingCobra extends Analyzer {

  damage = 0;
  focusGained = 0;
  focusWasted = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPITTING_COBRA_TALENT.id);
  }

  on_byPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SPITTING_COBRA_TALENT.id) {
      return;
    }
    this.focusGained += event.resourceChange - event.waste;
    this.focusWasted += event.waste;
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SPITTING_COBRA_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <TalentStatisticBox
        icon={<SpellIcon id={SPELLS.SPITTING_COBRA_TALENT.id} />}
        value={
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            gained {this.focusGained} focus <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} />
          </>
        }
        label="Spitting Cobra"
        tooltip={`You wasted ${this.focusWasted} focus by being too close to focus cap when Spitting Cobra gave you focus.`}
      />
    );
  }

}

export default SpittingCobra;
