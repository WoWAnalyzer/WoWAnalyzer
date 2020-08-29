import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { CastEvent } from 'parser/core/Events';

/**
 * Aimed Shot has a 100% chance to reduce the focus cost of your next Arcane Shot or Multi-Shot by 100%.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=summary&source=25
 */

const FOCUS_COST = 15;

class MasterMarksman extends Analyzer {

  overwrittenBuffs = 0;
  usedProcs = 0;

  affectedSpells = {
    [SPELLS.ARCANE_SHOT.id]: {
      casts: 0,
      name: SPELLS.ARCANE_SHOT.name,
    },
    [SPELLS.MULTISHOT_MM.id]: {
      casts: 0,
      name: SPELLS.MULTISHOT_MM.name,
    },
  };

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_MARKSMAN_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AIMED_SHOT), this.onAimedCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.MULTISHOT_MM, SPELLS.ARCANE_SHOT]), this.onSpenderCast);
  }

  onAimedCast() {
    if (!this.selectedCombatant.hasBuff(SPELLS.MASTER_MARKSMAN_BUFF.id)) {
      return;
    }
    this.overwrittenBuffs += 1;
  }

  onSpenderCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.MASTER_MARKSMAN_BUFF.id)) {
      return;
    }
    this.usedProcs += 1;
    this.affectedSpells[event.ability.guid].casts += 1;
  }

  get totalProcs() {
    return this.overwrittenBuffs + this.usedProcs;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            You gained a total of {this.totalProcs} procs, and utilised {this.usedProcs} of them.
            <ul>
              {this.affectedSpells[SPELLS.ARCANE_SHOT.id].casts > 0 && (
                <li>Out of the total procs, you used {this.affectedSpells[SPELLS.ARCANE_SHOT.id].casts} of them on {this.affectedSpells[SPELLS.ARCANE_SHOT.id].name}.
                  <ul>
                    <li>This saved you a total of {this.affectedSpells[SPELLS.ARCANE_SHOT.id].casts * FOCUS_COST} Focus.</li>
                  </ul>
                </li>
              )}
              {this.affectedSpells[SPELLS.MULTISHOT_MM.id].casts > 0 && (
                <li>Out of the total procs, you used {this.affectedSpells[SPELLS.MULTISHOT_MM.id].casts} of them on {this.affectedSpells[SPELLS.MULTISHOT_MM.id].name}.
                  <ul>
                    <li>This saved you a total of {this.affectedSpells[SPELLS.MULTISHOT_MM.id].casts * FOCUS_COST} Focus.</li>
                  </ul>
                </li>
              )}
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.MASTER_MARKSMAN_TALENT}>
          <>
            {this.usedProcs}/{this.totalProcs} <small>procs used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MasterMarksman;
