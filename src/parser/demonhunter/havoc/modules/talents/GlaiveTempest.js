import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { formatThousands } from 'common/format';
import Events from 'parser/core/Events';

class GlaiveTempest extends Analyzer {

    damage = 0;

    constructor(...args) {
        super(...args);
        this.active = this.selectedCombatant.hasTalent(SPELLS.GLAIVE_TEMPEST_TALENT.id);
        if (!this.active) {
          return;
        }
        this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GLAIVE_TEMPEST_DAMAGE), this.onDamageEvent);
      }

    onDamageEvent(event) {
      this.damage += event.amount + (event.absorb || 0);
      }

    statistic() {
        return (
          <TalentStatisticBox
            talent={SPELLS.GLAIVE_TEMPEST_TALENT.id}
            position={STATISTIC_ORDER.OPTIONAL(6)}
            value={(
                <>
                  {this.owner.formatItemDamageDone(this.damage)}
                </>
            )}
            tooltip={(
                <>
                  {formatThousands(this.damage)} Total damage<br />
                </>
            )}
          />
        );
    }    
}

export default GlaiveTempest;
