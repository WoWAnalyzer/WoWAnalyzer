import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { FEROCIOUS_APPETITE_ASPECT_REDUCTION } from 'parser/hunter/beastmastery/constants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';
import ConduitSpellText from 'parser/ui/ConduitSpellText';

/**
 * Kill Command critical hits reduce the cooldown of Aspect of the Wild by 1.0 sec.
 *
 * Example log
 *
 */
class FerociousAppetite extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  conduitRank: number = 0;
  addedDamage: number = 0;
  effectiveCDR: number = 0;
  wastedCDR: number = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.FEROCIOUS_APPETITE_CONDUIT.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.KILL_COMMAND_DAMAGE_BM), this.onKillCommandDamage);
  }

  onKillCommandDamage(event: DamageEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.ASPECT_OF_THE_WILD.id)) {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.ASPECT_OF_THE_WILD.id, FEROCIOUS_APPETITE_ASPECT_REDUCTION[this.conduitRank]);
      this.effectiveCDR += reductionMs;
      this.wastedCDR += FEROCIOUS_APPETITE_ASPECT_REDUCTION[this.conduitRank] - reductionMs;
    } else {
      this.wastedCDR += FEROCIOUS_APPETITE_ASPECT_REDUCTION[this.conduitRank];
    }

  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spell={SPELLS.FEROCIOUS_APPETITE_CONDUIT} rank={this.conduitRank}>
          <>
            {this.effectiveCDR}/{this.effectiveCDR + this.wastedCDR} <small>effective cooldown reduction</small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }

}

export default FerociousAppetite;
