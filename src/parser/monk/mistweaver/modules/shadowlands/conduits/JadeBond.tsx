import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET, Options } from 'parser/core/Analyzer';

import SpellUsable from 'parser/shared/modules/SpellUsable';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';
import { formatNumber } from 'common/format';
import Spell from 'common/SPELLS/Spell';

import {JADE_BOND_RANK_ONE, conduitScaling} from '../../../constants';

const JADE_BOND_REDUCTION = 300;

class JadeBond extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    healingDone: HealingDone,
  };

  protected spellUsable!: SpellUsable;
  protected healingDone!: HealingDone;


  cooldownReductionUsed: number = 0;
  cooldownReductionWasted: number = 0;
  spellToReduce: Spell = SPELLS.INVOKE_YULON_THE_JADE_SERPENT;
  healingBoost: number = 0;
  healing: number = 0;
  conduitRank: number = 0;

  /**
   * Whenever you cast a Gust of Mist procing ability it reduces the cooldown of Yu'lon or Chi-ji by .5 seconds as well as increasing their healing by x%
   */
  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.JADE_BOND.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.healingBoost = conduitScaling(JADE_BOND_RANK_ONE, this.conduitRank);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.EXPEL_HARM, SPELLS.VIVIFY, SPELLS.RENEWING_MIST, SPELLS.ENVELOPING_MIST]), this.gustProcingSpell);

    if(this.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id)){
      this.spellToReduce = SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT;
      this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI), this.normalizeBoost);
    }else{
      this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_BREATH), this.normalizeBoost);
    }

  }

  gustProcingSpell(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(this.spellToReduce.id)) {
      this.cooldownReductionUsed += this.spellUsable.reduceCooldown(this.spellToReduce.id, JADE_BOND_REDUCTION);
    } else {
      this.cooldownReductionWasted += JADE_BOND_REDUCTION;
    }
  }

  normalizeBoost(event: HealEvent){
    this.healing += calculateEffectiveHealing(event, this.healingBoost);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={(
        <>
          Effective Cooldown Reduction: {formatNumber(this.cooldownReductionUsed/1000)} Seconds<br />
          Wasted Cooldown Reduction: {formatNumber(this.cooldownReductionWasted/1000)} Seconds
        </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.JADE_BOND}>
          <ItemHealingDone amount={this.healing} /><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default JadeBond;
