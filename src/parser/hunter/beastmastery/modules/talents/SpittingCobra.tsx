import React from 'react';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent, EnergizeEvent } from 'parser/core/Events';

/**
 *
 * Summons a Spitting Cobra for 20 sec that attacks your target for (31.2% ofAttack power) Nature damage every 2 sec.
 * While the Cobra is active you gain 2 Focus every sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Z6GjqpNcvw3kBAL2#fight=3&type=damage-done
 */

const FOCUS_PER_ENERGIZE = 2;

class SpittingCobra extends Analyzer {

  damage = 0;
  focusGained = 0;
  focusWasted = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPITTING_COBRA_TALENT.id);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.SPITTING_COBRA_TALENT), this.onCobraEnergize);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SPITTING_COBRA_DAMAGE), this.onCobraDamage);
  }

  onCobraEnergize(event: EnergizeEvent) {
    this.focusGained += event.resourceChange - event.waste;
    //event.waste doesn't always contain the amount of focus wasted in the energize events from this talent so we need to the check below
    if (event.resourceChange < FOCUS_PER_ENERGIZE && event.waste === 0) {
      this.focusWasted += FOCUS_PER_ENERGIZE - event.resourceChange;
    } else {
      this.focusWasted += event.waste;
    }
  }

  onCobraDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.SPITTING_COBRA_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            {this.focusGained}/{this.focusGained+this.focusWasted} <small>focus gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SpittingCobra;
