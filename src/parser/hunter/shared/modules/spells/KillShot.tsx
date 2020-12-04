import React from 'react';

import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import { KILL_SHOT_EXECUTE_RANGE } from 'parser/hunter/shared/constants';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import SPECS from 'game/SPECS';
import ExecuteHelper from 'parser/shared/ExecuteHelper';
import FlayedShot from 'parser/hunter/shared/modules/spells/covenants/venthyr/FlayedShot';

class KillShot extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = KILL_SHOT_EXECUTE_RANGE;
  static executeOutsideRangeEnablers = [SPELLS.FLAYERS_MARK];
  static modifiesDamage = false;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
    flayedShot: FlayedShot,
  };

  maxCasts: number = 0;
  activeKillShotSpell = this.selectedCombatant.spec === SPECS.SURVIVAL_HUNTER ? SPELLS.KILL_SHOT_SV : SPELLS.KILL_SHOT_MM_BM;

  protected abilities!: Abilities;
  protected flayedShot!: FlayedShot;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.fightend, this.adjustMaxCasts);
    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(this.activeKillShotSpell);

    (options.abilities as Abilities).add({
      spell: this.activeKillShotSpell,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      charges: this.selectedCombatant.hasTalent(SPELLS.DEAD_EYE_TALENT.id) ? 2 : 1,
      cooldown: 10,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.85,
        maxCasts: () => this.maxCasts,
      },
    });
  }

  adjustMaxCasts() {
    this.maxCasts += Math.ceil(this.totalExecuteDuration / 10000);
    if (this.selectedCombatant.hasTalent(SPELLS.DEAD_EYE_TALENT.id)) {
      this.maxCasts += 1;
    }
    this.maxCasts += this.flayedShot.totalProcs;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spell={this.activeKillShotSpell}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default KillShot;
