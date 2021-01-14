import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';
import SPELLS from 'common/SPELLS';
import React from 'react';
import { BASELINE_TURTLE_CHEETAH_CD, BORN_TO_BE_WILD_CD_REDUCTION, CALL_OF_THE_WILD_CD_REDUCTION } from 'parser/hunter/shared/constants';
import Events, { CastEvent } from 'parser/core/Events';
import { formatNumber } from 'common/format';

const debug = false;

class HarmonyOfTheTortollan extends Analyzer {

  conduitRank = 0;
  turtleCooldown = BASELINE_TURTLE_CHEETAH_CD
    * (1 - (this.selectedCombatant.hasTalent(SPELLS.BORN_TO_BE_WILD_TALENT.id) ? BORN_TO_BE_WILD_CD_REDUCTION : 0))
    * (1 - (this.selectedCombatant.hasLegendaryByBonusID(SPELLS.CALL_OF_THE_WILD_EFFECT.id) ? CALL_OF_THE_WILD_CD_REDUCTION : 0));
  lastCast = 0;
  effectiveReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ASPECT_OF_THE_TURTLE), this.onCast);
  }

  onCast(event: CastEvent) {
    debug && console.log(event.timestamp, `Turtle cast - time since last cast: `, this.lastCast !== 0 ? (event.timestamp - this.lastCast) / 1000 : 'no previous cast');

    if (this.lastCast && event.timestamp < this.lastCast + this.turtleCooldown) {
      this.effectiveReduction += this.turtleCooldown - (event.timestamp - this.lastCast);
    }
    this.lastCast = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={(
          <>
            Effective CDR is the time that was left of the original cooldown (before reduction from Harmony of the Tortollan) when you cast it again as that is the effective cooldown reduction this conduit provided for you.
          </>
        )}
      >
        <ConduitSpellText spell={SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT} rank={this.conduitRank}>
          <>
            {formatNumber(this.effectiveReduction / 1000)}s <small>effective CDR</small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }

}

export default HarmonyOfTheTortollan;
