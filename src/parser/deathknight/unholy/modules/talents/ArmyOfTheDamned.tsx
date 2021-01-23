import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { CastEvent, FightEndEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import CooldownIcon from 'interface/icons/Cooldown'

const AOTD_APOCALYPSE_REDUCTION_MS = 1000;
const AOTD_ARMY_REDUCTION_MS = 5000;

class ArmyOfTheDamned extends Analyzer {
  static dependencies = {
    spellUsable : SpellUsable,
  }

  protected spellUsable!: SpellUsable

  totalApocalypseReductionMs: number = 0;
  totalArmyReductionMs: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.ARMY_OF_THE_DAMNED_TALENT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.DEATH_COIL, SPELLS.EPIDEMIC]), this.onCdrCast);
  }

  onCdrCast(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.APOCALYPSE.id)) {
      this.spellUsable.reduceCooldown(SPELLS.APOCALYPSE.id, AOTD_APOCALYPSE_REDUCTION_MS, event.timestamp);
      this.totalApocalypseReductionMs += AOTD_APOCALYPSE_REDUCTION_MS;
    }

    if (this.spellUsable.isOnCooldown(SPELLS.ARMY_OF_THE_DEAD.id)) {
      this.spellUsable.reduceCooldown(SPELLS.ARMY_OF_THE_DEAD.id, AOTD_ARMY_REDUCTION_MS, event.timestamp);
      this.totalArmyReductionMs += AOTD_ARMY_REDUCTION_MS;
    }
  }

  endCooldowns(event: FightEndEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.ARMY_OF_THE_DEAD.id)) {
      this.spellUsable.endCooldown(SPELLS.ARMY_OF_THE_DEAD.id);
    }

    if (this.spellUsable.isOnCooldown(SPELLS.APOCALYPSE.id)) {
      this.spellUsable.endCooldown(SPELLS.APOCALYPSE.id);
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.ARMY_OF_THE_DAMNED_TALENT}>
          <>
            <CooldownIcon /> {this.totalApocalypseReductionMs / 1000}s <small>  of Apocalypse CDR</small>
            <br/>
            <CooldownIcon /> {this.totalArmyReductionMs / 1000}s <small>  of Army of the Dead CDR</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    )
  }
}

export default ArmyOfTheDamned;
