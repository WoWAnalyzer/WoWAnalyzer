import React from 'react';

import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events, { FightEndEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import ExecuteHelper from 'parser/shared/ExecuteHelper';

const SOUL_REAPER_EXECUTE_RANGE = .35

class SoulReaper extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = SOUL_REAPER_EXECUTE_RANGE;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  maxCasts: number = 0;

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id); 
    this.addEventListener(Events.fightend, this.adjustMaxCasts);
    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(SPELLS.SOUL_REAPER_TALENT);

    (options.abilities as Abilities).add({
      spell: SPELLS.SOUL_REAPER_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      cooldown: 6,
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

  adjustMaxCasts(event: FightEndEvent) {
    super.onFightEnd(event)
    this.maxCasts += Math.ceil(this.totalExecuteDuration / 6000);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(30)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.SOUL_REAPER_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulReaper;
