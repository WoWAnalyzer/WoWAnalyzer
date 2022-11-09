import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import {
  BASELINE_TURTLE_CHEETAH_CD,
  BORN_TO_BE_WILD_CD_REDUCTION,
  CALL_OF_THE_WILD_CD_REDUCTION,
} from '../constants';

const debug = false;

class HarmonyOfTheTortollan extends Analyzer {
  conduitRank = 0;
  turtleCooldown =
    BASELINE_TURTLE_CHEETAH_CD *
    (1 -
      (this.selectedCombatant.hasTalent(TALENTS.BORN_TO_BE_WILD_TALENT.id)
        ? BORN_TO_BE_WILD_CD_REDUCTION
        : 0)) *
    (1 -
      (this.selectedCombatant.hasLegendary(SPELLS.CALL_OF_THE_WILD_EFFECT)
        ? CALL_OF_THE_WILD_CD_REDUCTION
        : 0));
  lastCast = 0;
  effectiveReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(
      SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id,
    );
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(
      SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ASPECT_OF_THE_TURTLE),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    debug &&
      console.log(
        event.timestamp,
        `Turtle cast - time since last cast: `,
        this.lastCast !== 0 ? (event.timestamp - this.lastCast) / 1000 : 'no previous cast',
      );

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
        tooltip={
          <>
            Effective CDR is the time that was left of the original cooldown (before reduction from
            Harmony of the Tortollan) when you cast it again as that is the effective cooldown
            reduction this conduit provided for you.
          </>
        }
      >
        <ConduitSpellText
          spellId={SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id}
          rank={this.conduitRank}
        >
          <>
            {formatNumber(this.effectiveReduction / 1000)}s <small>effective CDR</small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default HarmonyOfTheTortollan;
