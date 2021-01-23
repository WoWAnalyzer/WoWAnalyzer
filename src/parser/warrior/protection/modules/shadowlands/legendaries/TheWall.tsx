import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { CastEvent } from 'parser/core/Events';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import { formatDuration } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import RageTracker from '../../core/RageTracker';


const REDUCTION = 5000;
const EXTRA_RAGE = 5;

/**
 * Whenever you cast a shield slam reduce shield wall by 5 second and gain 5 extra rage.
 */
class TheWall extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    rageTracker: RageTracker,
  };

  protected spellUsable!: SpellUsable;
  protected rageTracker!: RageTracker;

  effectiveCDR = 0;
  wastedCDR = 0;

  effectiveRage = 0;
  wastedRage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.THE_WALL.bonusID);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM), this.onCast);
  }

  onCast(event: CastEvent){
    if(this.spellUsable.isOnCooldown(SPELLS.SHIELD_WALL.id)){
      const cdr = this.spellUsable.reduceCooldown(SPELLS.SHIELD_WALL.id, REDUCTION);
      this.effectiveCDR += cdr;
      this.wastedCDR += (REDUCTION - cdr);
    }else{
      this.wastedCDR += REDUCTION;
    }

    if(this.rageTracker.maxResource > this.rageTracker.current + EXTRA_RAGE){
      this.effectiveRage += 5;
    }else{
      const effective = this.rageTracker.maxResource - this.rageTracker.current;
      this.effectiveRage += effective;
      this.wastedRage += (EXTRA_RAGE - effective);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={<>
        Wasted Rage: {this.wastedRage} <br />
        Wasted CDR: {formatDuration(this.wastedCDR/1000)}
        </>}
      >
        <BoringSpellValueText spell={SPELLS.THE_WALL}>
          {this.effectiveRage} <small>rage</small> <br />
          {formatDuration(this.effectiveCDR/1000)} <small>cdr</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TheWall;
